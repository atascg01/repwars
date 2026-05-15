import { prisma } from "@/lib/prisma";
import type { ChallengeType } from "@prisma/client";
import { countPRsInRange } from "./prDetection";

/**
 * Score all participants of a challenge based on its type.
 * Returns the number of participants scored.
 */
export async function scoreChallenge(challengeId: string): Promise<number> {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      participants: { select: { userId: true } },
    },
  });

  if (!challenge) throw new Error("Challenge not found");
  if (challenge.participants.length === 0) return 0;

  const userIds = challenge.participants.map((p) => p.userId);

  // Fetch all workouts by participants within the challenge window
  const workouts = await prisma.workout.findMany({
    where: {
      userId: { in: userIds },
      startTime: { gte: challenge.startDate, lte: challenge.endDate },
    },
    include: {
      exercises: { include: { sets: true } },
    },
  });

  // Compute per-user metrics
  const userVolumes: Record<string, number> = {};      // total volume
  const userSessions: Record<string, number> = {};      // workout count
  const userMaxSession: Record<string, number> = {};    // best single session
  const userCustomVol: Record<string, number> = {};     // exercise-specific volume

  for (const w of workouts) {
    let sessionVol = 0;
    let customVol = 0;

    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (s.weightKg && s.reps) {
          const setVol = s.weightKg * s.reps;
          sessionVol += setVol;

          // CUSTOM: only count volume for the target exercise
          if (
            challenge.exerciseFilter &&
            e.title.toLowerCase().includes(challenge.exerciseFilter.toLowerCase())
          ) {
            customVol += setVol;
          }
        }
      }
    }

    userVolumes[w.userId] = (userVolumes[w.userId] ?? 0) + sessionVol;
    userSessions[w.userId] = (userSessions[w.userId] ?? 0) + 1;
    userMaxSession[w.userId] = Math.max(userMaxSession[w.userId] ?? 0, sessionVol);
    userCustomVol[w.userId] = (userCustomVol[w.userId] ?? 0) + customVol;
  }

  // Assign scores based on challenge type
  const updates = [];
  for (const userId of userIds) {
    let score = 0;

    switch (challenge.type as ChallengeType) {
      case "IRON_KING":
        score = userVolumes[userId] ?? 0;
        break;
      case "CONSISTENCY":
        score = userSessions[userId] ?? 0;
        break;
      case "PR_BREAKER":
        score = await countPRsInRange(
          userId,
          challenge.startDate,
          challenge.endDate,
        );
        break;
      case "GRINDER":
        score = userMaxSession[userId] ?? 0;
        break;
      case "CUSTOM":
        score = userCustomVol[userId] ?? 0;
        break;
    }

    updates.push(
      prisma.challengeParticipant.update({
        where: {
          challengeId_userId: { challengeId, userId },
        },
        data: { score },
      }),
    );
  }

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }

  return updates.length;
}

/**
 * Complete a challenge: assign ranks, set status to COMPLETED.
 */
export async function completeChallenge(challengeId: string): Promise<void> {
  const participants = await prisma.challengeParticipant.findMany({
    where: { challengeId },
    orderBy: { score: "desc" },
  });

  if (participants.length === 0) {
    await prisma.challenge.update({
      where: { id: challengeId },
      data: { status: "COMPLETED" },
    });
    return;
  }

  // Assign ranks (1st, 2nd, 3rd... handle ties)
  const updates = [];
  let currentRank = 1;
  let prevScore: number | null = null;

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    if (prevScore !== null && p.score < prevScore) {
      currentRank = i + 1;
    }
    updates.push(
      prisma.challengeParticipant.update({
        where: { id: p.id },
        data: { rank: currentRank },
      }),
    );
    prevScore = p.score;
  }

  updates.push(
    prisma.challenge.update({
      where: { id: challengeId },
      data: { status: "COMPLETED" },
    }),
  );

  await prisma.$transaction(updates);
}

/**
 * Check all active challenges and complete any that have ended.
 */
export async function completeExpiredChallenges(): Promise<number> {
  const expired = await prisma.challenge.findMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: new Date() },
    },
    select: { id: true },
  });

  for (const ch of expired) {
    await scoreChallenge(ch.id);
    await completeChallenge(ch.id);
  }

  return expired.length;
}
