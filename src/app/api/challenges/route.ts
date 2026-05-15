import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getInitials } from "@/lib/utils";

/** GET /api/challenges — List challenges across all crews user is in */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all crew IDs the user belongs to
  const memberships = await prisma.crewMember.findMany({
    where: { userId: session.user.id },
    select: { crewId: true },
  });
  const crewIds = memberships.map((m) => m.crewId);

  if (crewIds.length === 0) {
    return NextResponse.json({ active: [], completed: [] });
  }

  // Active challenges
  const active = await prisma.challenge.findMany({
    where: {
      crewId: { in: crewIds },
      status: { in: ["ACTIVE", "UPCOMING"] },
    },
    include: {
      crew: { select: { id: true, name: true } },
      participants: {
        include: {
          user: { select: { id: true, displayName: true, image: true } },
        },
        orderBy: { score: "desc" },
      },
      _count: { select: { participants: true } },
    },
    orderBy: { endDate: "asc" },
  });

  // Completed challenges
  const completed = await prisma.challenge.findMany({
    where: {
      crewId: { in: crewIds },
      status: "COMPLETED",
    },
    include: {
      crew: { select: { id: true, name: true } },
      participants: {
        where: { rank: 1 },
        include: {
          user: { select: { id: true, displayName: true, image: true } },
        },
      },
      _count: { select: { participants: true } },
    },
    orderBy: { endDate: "desc" },
    take: 20,
  });

  // Build active list
  const uid = session.user.id;
  const activeList = [];
  for (const ch of active) {
    const leader = ch.participants[0];
    const yourPart = ch.participants.find(
      (p) => p.user.id === uid
    );
    activeList.push({
      id: ch.id,
      crewName: ch.crew.name,
      type: ch.type,
      title: ch.title,
      leader: leader
        ? {
            name: leader.user.displayName ?? "Unknown",
            initials: getInitials(leader.user.displayName),
            score: leader.score,
          }
        : null,
      participants: ch._count.participants,
      yourRank: yourPart?.rank ?? null,
      yourScore: yourPart?.score ?? 0,
      endDate: ch.endDate.toISOString(),
    });
  }

  // Build completed list
  const completedList = [];
  for (const ch of completed) {
    const winner = ch.participants[0];
    const yourPart = ch.participants.find(
      (p) => p.user.id === uid
    );
    completedList.push({
      id: ch.id,
      crewName: ch.crew.name,
      type: ch.type,
      title: ch.title,
      winner: winner
        ? {
            name: winner.user.displayName ?? "Unknown",
            initials: getInitials(winner.user.displayName),
          }
        : null,
      participants: ch._count.participants,
      yourRank: yourPart?.rank ?? null,
      yourScore: yourPart?.score ?? 0,
      endedAt: ch.endDate.toISOString(),
    });
  }

  return NextResponse.json({ active: activeList, completed: completedList });
}

/** POST /api/challenges — Create a new challenge in a crew */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { crewId, type, title, description, startDate, endDate, exerciseFilter } =
    await req.json();

  if (!crewId?.trim() || !type?.trim() || !title?.trim()) {
    return NextResponse.json(
      { error: "crewId, type, and title are required" },
      { status: 400 }
    );
  }

  // Verify membership
  const membership = await prisma.crewMember.findUnique({
    where: { crewId_userId: { crewId, userId: session.user.id } },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "Not a member of this crew" },
      { status: 403 }
    );
  }

  // Auto-add creator as participant
  const challenge = await prisma.challenge.create({
    data: {
      crewId,
      createdById: session.user.id,
      type,
      title: title.trim(),
      description: description?.trim() || null,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate
        ? new Date(endDate)
        : new Date(Date.now() + 7 * 86400000),
      exerciseFilter: exerciseFilter?.trim() || null,
      status: "ACTIVE",
      participants: {
        create: {
          userId: session.user.id,
          score: 0,
        },
      },
    },
  });

  return NextResponse.json({ challenge }, { status: 201 });
}
