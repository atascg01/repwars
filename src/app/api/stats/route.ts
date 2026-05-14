import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/stats — Get current user's dashboard stats */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Parallel fetch all stats
  const [user, recentWorkouts, muscleVolume, challengeWins] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          displayName: true,
          image: true,
          totalVolumeLifted: true,
          currentStreak: true,
          longestStreak: true,
          unitPreference: true,
        },
      }),

      prisma.workout.findMany({
        where: { userId },
        orderBy: { startTime: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          startTime: true,
          exercises: {
            select: {
              sets: {
                select: { weightKg: true, reps: true },
              },
            },
          },
        },
      }),

      prisma.$queryRaw<{ muscle_group: string; total_volume: number }[]>`
        SELECT we."muscleGroup" as muscle_group, 
               SUM(ws."weightKg" * ws."reps") as total_volume
        FROM "WorkoutExercise" we
        JOIN "WorkoutSet" ws ON ws."exerciseId" = we."id"
        JOIN "Workout" w ON w."id" = we."workoutId"
        WHERE w."userId" = ${userId}
          AND w."startTime" >= ${getWeekStart()}
          AND ws."weightKg" IS NOT NULL 
          AND ws."reps" IS NOT NULL
        GROUP BY we."muscleGroup"
      `,

      prisma.challengeParticipant.count({
        where: { userId, rank: 1 },
      }),
    ]);

  // Calculate weekly volume from recent workouts
  const weekStart = getWeekStart();
  const weekWorkouts = await prisma.workout.findMany({
    where: { userId, startTime: { gte: weekStart } },
    include: { exercises: { include: { sets: true } } },
  });

  let weekTotal = 0;
  for (const w of weekWorkouts) {
    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (s.weightKg && s.reps) weekTotal += s.weightKg * s.reps;
      }
    }
  }

  return NextResponse.json({
    profile: user,
    stats: {
      weeklyVolume: Math.round(weekTotal),
      weeklyWorkouts: weekWorkouts.length,
      challengeWins,
      muscleVolume,
    },
    recentWorkouts: recentWorkouts.map((w) => ({
      id: w.id,
      title: w.title,
      date: w.startTime,
      volume: w.exercises.reduce(
        (sum, e) =>
          sum +
          e.sets.reduce(
            (s, set) => s + (set.weightKg && set.reps ? set.weightKg * set.reps : 0),
            0
          ),
        0
      ),
    })),
  });
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
