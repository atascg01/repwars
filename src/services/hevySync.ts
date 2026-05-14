import { prisma } from "@/lib/prisma";

const HEVY_API_BASE = "https://api.hevyapp.com/v1";
const PAGE_SIZE = 10;

// ── Hevy API types ──

interface HevyWorkoutListResponse {
  page: number;
  page_count: number;
  workouts: HevyWorkout[];
}

interface HevyWorkout {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_private: boolean;
  exercises: HevyExercise[];
}

interface HevyExercise {
  exercise_template_id: string;
  title: string;
  notes: string | null;
  superset_id: number | null;
  rest_seconds: number | null;
  sets: HevySet[];
}

interface HevySet {
  type: string;
  weight_kg: number | null;
  reps: number | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  rpe: number | null;
}

export interface SyncResult {
  imported: number;
  skipped: number;
}

/**
 * Fetch all pages of workouts from the Hevy API.
 */
async function fetchAllWorkouts(apiKey: string): Promise<HevyWorkout[]> {
  const allWorkouts: HevyWorkout[] = [];
  let page = 1;

  while (true) {
    const url = `${HEVY_API_BASE}/workouts?page=${page}&pageSize=${PAGE_SIZE}`;
    const res = await fetch(url, {
      headers: {
        "api-key": apiKey,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Hevy API error (${res.status}): ${errorText.slice(0, 200)}`
      );
    }

    const data: HevyWorkoutListResponse = await res.json();
    allWorkouts.push(...data.workouts);

    if (page >= data.page_count) break;
    page++;
  }

  return allWorkouts;
}

/**
 * Calculate volume for a single set.
 */
function setVolume(set: HevySet): number {
  if (set.weight_kg && set.reps) {
    return set.weight_kg * set.reps;
  }
  return 0;
}

/**
 * Sync Hevy workouts for a user:
 * - Fetch all workouts from Hevy API
 * - Dedup by hevyWorkoutId
 * - Store workouts, exercises, and sets in DB
 * - Update user.totalVolumeLifted
 */
export async function syncHevyWorkouts(
  userId: string,
  apiKey: string
): Promise<SyncResult> {
  const workouts = await fetchAllWorkouts(apiKey);

  let imported = 0;
  let skipped = 0;
  let totalNewVolume = 0;

  for (const w of workouts) {
    // Dedup by Hevy workout ID
    const existing = await prisma.workout.findFirst({
      where: {
        userId,
        hevyWorkoutId: w.id,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    // Calculate session volume
    let sessionVolume = 0;
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        sessionVolume += setVolume(s);
      }
    }

    await prisma.workout.create({
      data: {
        userId,
        source: "api",
        hevyWorkoutId: w.id,
        title: w.title,
        description: w.description,
        startTime: new Date(w.start_time),
        endTime: new Date(w.end_time),
        isPrivate: w.is_private,
        exercises: {
          create: w.exercises.map((ex, ei) => ({
            hevyTemplateId: ex.exercise_template_id,
            title: ex.title,
            notes: ex.notes,
            supersetId: ex.superset_id,
            restSeconds: ex.rest_seconds,
            sortOrder: ei,
            sets: {
              create: ex.sets.map((s, si) => ({
                setType: s.type || "normal",
                weightKg: s.weight_kg,
                reps: s.reps,
                distanceMeters: s.distance_meters,
                durationSeconds: s.duration_seconds,
                rpe: s.rpe,
                sortOrder: si,
              })),
            },
          })),
        },
      },
    });

    totalNewVolume += sessionVolume;
    imported++;
  }

  // Update user stats
  if (imported > 0) {
    const latestWorkout = workouts.reduce((latest, w) => {
      const endTime = new Date(w.end_time);
      return endTime > new Date(latest.end_time) ? w : latest;
    }, workouts[0]);

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalVolumeLifted: { increment: totalNewVolume },
        lastWorkoutDate: new Date(latestWorkout.end_time),
      },
    });
  }

  return { imported, skipped };
}
