import { prisma } from "@/lib/prisma";

interface PRResult {
  exerciseTitle: string;
  repRange: string; // e.g. "3-5" or "8-12"
  weightKg: number;
  reps: number;
  previousBest: number;
  workoutId: string;
  date: Date;
}

/**
 * Detect personal records in a set of workouts.
 * A PR is a new best weight for a given exercise + rep range.
 * Rep ranges: 1-3, 4-6, 7-9, 10-15, 15+
 */
function getRepRange(reps: number): string {
  if (reps <= 3) return "1-3";
  if (reps <= 6) return "4-6";
  if (reps <= 9) return "7-9";
  if (reps <= 15) return "10-15";
  return "15+";
}

/**
 * Find all PRs for a user's recent workouts (last N days).
 * Compares each set against the user's history for the same exercise + rep range.
 */
export async function detectPRs(
  userId: string,
  sinceDays = 7,
): Promise<PRResult[]> {
  const since = new Date();
  since.setDate(since.getDate() - sinceDays);

  // Get recent workouts
  const recentWorkouts = await prisma.workout.findMany({
    where: { userId, startTime: { gte: since } },
    include: { exercises: { include: { sets: true } } },
    orderBy: { startTime: "asc" },
  });

  // Get all historical workouts (before the recent window) for comparison
  const allWorkouts = await prisma.workout.findMany({
    where: { userId },
    include: { exercises: { include: { sets: true } } },
    orderBy: { startTime: "asc" },
  });

  // Build best-per-exercise-per-rep-range from history
  const bests: Record<string, Record<string, number>> = {}; // exerciseTitle -> repRange -> best weight
  const recentCutoff = since.getTime();

  for (const w of allWorkouts) {
    const isRecent = w.startTime.getTime() >= recentCutoff;
    for (const e of w.exercises) {
      if (!bests[e.title]) bests[e.title] = {};
      for (const s of e.sets) {
        if (!s.weightKg || !s.reps) continue;
        const range = getRepRange(s.reps);
        const current = bests[e.title][range] ?? 0;

        // Only count as "history" if it's before the recent window
        if (!isRecent) {
          if (s.weightKg > current) {
            bests[e.title][range] = s.weightKg;
          }
        }
      }
    }
  }

  // Now check recent workouts for PRs
  const prs: PRResult[] = [];
  for (const w of recentWorkouts) {
    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (!s.weightKg || !s.reps) continue;
        const range = getRepRange(s.reps);
        const prevBest = bests[e.title]?.[range] ?? 0;

        if (prevBest > 0 && s.weightKg > prevBest) {
          // Don't report the same PR multiple times in the same window
          const alreadyReported = prs.some(
            (p) =>
              p.exerciseTitle === e.title &&
              p.repRange === range &&
              p.weightKg === s.weightKg,
          );
          if (!alreadyReported) {
            prs.push({
              exerciseTitle: e.title,
              repRange: range,
              weightKg: s.weightKg,
              reps: s.reps,
              previousBest: prevBest,
              workoutId: w.id,
              date: w.startTime,
            });
            // Update bests to avoid reporting the same value again
            if (!bests[e.title]) bests[e.title] = {};
            bests[e.title][range] = s.weightKg;
          }
        }
      }
    }
  }

  return prs;
}

/**
 * Count total PRs broken by a user within a date range.
 * Used by PR_BREAKER challenge scoring.
 */
export async function countPRsInRange(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const prs = await detectPRsForPeriod(userId, startDate, endDate);
  return prs.length;
}

async function detectPRsForPeriod(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<PRResult[]> {
  // Get workouts in the period
  const periodWorkouts = await prisma.workout.findMany({
    where: { userId, startTime: { gte: startDate, lte: endDate } },
    include: { exercises: { include: { sets: true } } },
    orderBy: { startTime: "asc" },
  });

  // Get history before the period
  const historyWorkouts = await prisma.workout.findMany({
    where: { userId, startTime: { lt: startDate } },
    include: { exercises: { include: { sets: true } } },
    orderBy: { startTime: "asc" },
  });

  // Build bests from history
  const bests: Record<string, Record<string, number>> = {};
  for (const w of historyWorkouts) {
    for (const e of w.exercises) {
      if (!bests[e.title]) bests[e.title] = {};
      for (const s of e.sets) {
        if (!s.weightKg || !s.reps) continue;
        const range = getRepRange(s.reps);
        bests[e.title][range] = Math.max(bests[e.title][range] ?? 0, s.weightKg);
      }
    }
  }

  // Detect PRs in the period
  const prs: PRResult[] = [];
  for (const w of periodWorkouts) {
    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (!s.weightKg || !s.reps) continue;
        const range = getRepRange(s.reps);
        const prevBest = bests[e.title]?.[range] ?? 0;

        if (s.weightKg > prevBest) {
          prs.push({
            exerciseTitle: e.title,
            repRange: range,
            weightKg: s.weightKg,
            reps: s.reps,
            previousBest: prevBest,
            workoutId: w.id,
            date: w.startTime,
          });
          if (!bests[e.title]) bests[e.title] = {};
          bests[e.title][range] = s.weightKg;
        }
      }
    }
  }

  return prs;
}
