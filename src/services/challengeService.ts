import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Type for workout with nested exercises and sets
type WorkoutWithExercises = Prisma.WorkoutGetPayload<{
  include: { exercises: { include: { sets: true } } };
}>;

/**
 * Score a single participant for a specific challenge.
 * Returns the calculated score based on challenge type.
 */
export async function calculateChallengeScore(
  challengeId: string,
  userId: string
): Promise<number> {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      participants: { include: { user: true } },
    },
  });

  if (!challenge) throw new Error("Challenge not found");

  // Get all workouts for this user in the challenge date range
  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      startTime: { gte: challenge.startDate },
      endTime: { lte: challenge.endDate },
    },
    include: {
      exercises: {
        include: { sets: true },
      },
    },
  });

  switch (challenge.type) {
    case "IRON_KING":
      return scoreIronKing(workouts);

    case "CONSISTENCY":
      return scoreConsistency(workouts, challenge);

    case "PR_BREAKER":
      return scorePrBreaker(workouts, userId, challenge);

    case "GRINDER":
      return scoreGrinder(workouts);

    case "CUSTOM":
      return scoreCustom(workouts, challenge);

    default:
      return 0;
  }
}

// ── Individual Scoring Functions ──────────────────────────

/** Total volume (weight × reps) across all sets in the challenge period */
function scoreIronKing(
  workouts: WorkoutWithExercises[]
): number {
  let total = 0;
  for (const w of workouts) {
    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (s.weightKg && s.reps) {
          total += s.weightKg * s.reps;
        }
      }
    }
  }
  return Math.round(total);
}

/** Number of distinct workout days in the challenge period */
function scoreConsistency(
  workouts: WorkoutWithExercises[],
  challenge: Awaited<ReturnType<typeof prisma.challenge.findUnique>>
): number {
  const days = new Set(
    workouts.map((w) => w.startTime.toISOString().split("T")[0])
  );
  return days.size;
}

/**
 * Number of new PRs broken during the challenge period.
 * A "PR" is defined as the highest weight × reps for a given exercise.
 */
async function scorePrBreaker(
  workouts: WorkoutWithExercises[],
  userId: string,
  challenge: Awaited<ReturnType<typeof prisma.challenge.findUnique>>
): Promise<number> {
  if (!challenge) return 0;

  // Get all historical workouts BEFORE this challenge to establish baselines
  const previousWorkouts = await prisma.workout.findMany({
    where: {
      userId,
      startTime: { lt: challenge.startDate },
    },
    include: {
      exercises: { include: { sets: true } },
    },
  });

  // Build pre-challenge PRs per exercise title
  const prePRs = new Map<string, number>();
  for (const w of previousWorkouts) {
    for (const e of w.exercises) {
      const key = e.title;
      for (const s of e.sets) {
        if (s.weightKg && s.reps) {
          const volume = s.weightKg * s.reps;
          const current = prePRs.get(key) ?? 0;
          if (volume > current) prePRs.set(key, volume);
        }
      }
    }
  }

  // Count new PRs in challenge period
  let prCount = 0;
  const newPRs = new Map<string, number>(prePRs);
  for (const w of workouts) {
    for (const e of w.exercises) {
      const key = e.title;
      for (const s of e.sets) {
        if (s.weightKg && s.reps) {
          const volume = s.weightKg * s.reps;
          const previous = newPRs.get(key) ?? 0;
          if (volume > previous) {
            prCount++;
            newPRs.set(key, volume);
          }
        }
      }
    }
  }

  return prCount;
}

/** Highest single-workout volume in the challenge period */
function scoreGrinder(
  workouts: WorkoutWithExercises[]
): number {
  let maxVolume = 0;
  for (const w of workouts) {
    let sessionVolume = 0;
    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (s.weightKg && s.reps) {
          sessionVolume += s.weightKg * s.reps;
        }
      }
    }
    if (sessionVolume > maxVolume) maxVolume = sessionVolume;
  }
  return Math.round(maxVolume);
}

/** Volume for a specific exercise (filtered by exerciseFilter) */
function scoreCustom(
  workouts: WorkoutWithExercises[],
  challenge: Awaited<ReturnType<typeof prisma.challenge.findUnique>>
): number {
  const filter = challenge?.exerciseFilter?.toLowerCase();
  if (!filter) return 0;

  let total = 0;
  for (const w of workouts) {
    for (const e of w.exercises) {
      if (e.title.toLowerCase().includes(filter)) {
        for (const s of e.sets) {
          if (s.weightKg && s.reps) {
            total += s.weightKg * s.reps;
          }
        }
      }
    }
  }
  return Math.round(total);
}

/**
 * Calculate scores for ALL participants in a challenge and update ranks.
 */
export async function finalizeChallenge(challengeId: string) {
  const participants = await prisma.challengeParticipant.findMany({
    where: { challengeId },
  });

  // Calculate all scores
  const scores: { participantId: string; score: number }[] = [];
  for (const p of participants) {
    const score = await calculateChallengeScore(challengeId, p.userId);
    await prisma.challengeParticipant.update({
      where: { id: p.id },
      data: { score },
    });
    scores.push({ participantId: p.id, score });
  }

  // Assign ranks (highest score = rank 1)
  scores.sort((a, b) => b.score - a.score);
  let currentRank = 1;
  let prevScore = Infinity;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i].score < prevScore) {
      currentRank = i + 1;
    }
    prevScore = scores[i].score;
    await prisma.challengeParticipant.update({
      where: { id: scores[i].participantId },
      data: { rank: currentRank },
    });
  }

  // Mark challenge as completed
  await prisma.challenge.update({
    where: { id: challengeId },
    data: { status: "COMPLETED" },
  });
}
