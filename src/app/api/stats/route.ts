import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** GET /api/stats — Get current user's dashboard stats */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      displayName: true,
      image: true,
      totalVolumeLifted: true,
      currentStreak: true,
      longestStreak: true,
      unitPreference: true,
    },
  });

  // Fetch recent 5 workouts
  const recentWorkouts = await prisma.workout.findMany({
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
  });

  // Fetch this week's workouts for volume
  const weekStart = getWeekStart();
  const weekWorkouts = await prisma.workout.findMany({
    where: { userId, startTime: { gte: weekStart } },
    include: { exercises: { include: { sets: true } } },
  });

  // Calculate weekly volume
  let weekTotal = 0;
  for (const w of weekWorkouts) {
    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (s.weightKg && s.reps) {
          weekTotal += s.weightKg * s.reps;
        }
      }
    }
  }

  // Count challenge wins
  const challengeWins = await prisma.challengeParticipant.count({
    where: { userId, rank: 1 },
  });

  // Build recent workouts list (avoiding map for Vercel TS strictness)
  const recent = [];
  for (const w of recentWorkouts) {
    let volume = 0;
    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (s.weightKg && s.reps) {
          volume += s.weightKg * s.reps;
        }
      }
    }
    recent.push({
      id: w.id,
      title: w.title,
      date: w.startTime,
      volume,
    });
  }

  return NextResponse.json({
    profile: user,
    stats: {
      weeklyVolume: Math.round(weekTotal),
      weeklyWorkouts: weekWorkouts.length,
      challengeWins,
    },
    recentWorkouts: recent,
  });
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
