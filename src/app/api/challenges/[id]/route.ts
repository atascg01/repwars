import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/challenges/[id] — Get challenge detail with leaderboard */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      crew: { select: { id: true, name: true } },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              image: true,
              totalVolumeLifted: true,
              currentStreak: true,
            },
          },
        },
        orderBy: { score: "desc" },
      },
      _count: { select: { participants: true } },
    },
  });

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  // Count workouts for each participant in the challenge period
  const leaderboard = [];
  for (const p of challenge.participants) {
    const workoutCount = await prisma.workout.count({
      where: {
        userId: p.user.id,
        startTime: { gte: challenge.startDate },
        endTime: { lte: challenge.endDate },
      },
    });

    leaderboard.push({
      rank: p.rank,
      name: p.user.displayName ?? "Unknown",
      initials: getInitials(p.user.displayName),
      score: p.score,
      workouts: workoutCount,
      avatar: p.user.image,
      isMe: p.user.id === session.user.id,
    });
  }

  return NextResponse.json({
    id: challenge.id,
    crewId: challenge.crew.id,
    crewName: challenge.crew.name,
    type: challenge.type,
    title: challenge.title,
    description: challenge.description,
    startDate: challenge.startDate.toISOString(),
    endDate: challenge.endDate.toISOString(),
    status: challenge.status,
    participants: challenge._count.participants,
    leaderboard,
  });
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
