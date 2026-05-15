import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcWeeklyStreak } from "@/lib/streaks";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/crews/[id] — Get crew detail with members, challenges, and feed */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify membership
  const membership = await prisma.crewMember.findUnique({
    where: { crewId_userId: { crewId: id, userId: session.user.id } },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "Not a member of this crew" },
      { status: 403 }
    );
  }

  // Fetch crew with members and owner
  const crew = await prisma.crew.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, displayName: true, image: true } },
      members: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      challenges: {
        where: { status: { in: ["ACTIVE", "UPCOMING"] } },
        include: {
          participants: {
            include: {
              user: { select: { id: true, displayName: true, name: true, image: true } },
            },
            orderBy: { score: "desc" },
          },
        },
        orderBy: { startDate: "desc" },
        take: 1,
      },
      _count: { select: { members: true } },
    },
  });

  if (!crew) {
    return NextResponse.json({ error: "Crew not found" }, { status: 404 });
  }

  // Build members array — compute volume & streak from actual workouts
  const memberIds = crew.members.map((m) => m.user.id);

  // Fetch all workouts for all members in one batch
  const allMemberWorkouts = await prisma.workout.findMany({
    where: { userId: { in: memberIds } },
    select: {
      userId: true,
      startTime: true,
      exercises: { select: { sets: true } },
    },
  });

  // Group by userId
  const byUser: Record<string, { dates: Set<string>; volume: number }> = {};
  for (const w of allMemberWorkouts) {
    if (!byUser[w.userId]) {
      byUser[w.userId] = { dates: new Set(), volume: 0 };
    }
    const u = byUser[w.userId];
    u.dates.add(w.startTime.toISOString().slice(0, 10));
    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (s.weightKg && s.reps) u.volume += s.weightKg * s.reps;
      }
    }
  }

  const members = [];
  for (const m of crew.members) {
    const data = byUser[m.user.id] ?? { dates: new Set<string>(), volume: 0 };

    members.push({
      name: m.user.displayName ?? m.user.name ?? "Unknown",
      initials: getInitials(m.user.displayName ?? m.user.name),
      role: m.role,
      streak: calcWeeklyStreak(data.dates),
      volume: Math.round(data.volume),
      workouts: data.dates.size,
      avatar: m.user.image,
    });
  }

  // Build active challenge
  const activeChallenge = crew.challenges[0] ?? null;
  let challengeData = null;
  if (activeChallenge) {
    const leaderboard = [];
    for (const p of activeChallenge.participants) {
      leaderboard.push({
        rank: p.rank,
        name: p.user.displayName ?? p.user.name ?? "Unknown",
        initials: getInitials(p.user.displayName ?? p.user.name),
        score: p.score,
      });
    }
    challengeData = {
      id: activeChallenge.id,
      type: activeChallenge.type,
      title: activeChallenge.title,
      startDate: activeChallenge.startDate.toISOString(),
      endDate: activeChallenge.endDate.toISOString(),
      leaderboard,
    };
  }

  // Build past challenges
  const pastChallenges = await prisma.challenge.findMany({
    where: { crewId: id, status: "COMPLETED" },
    include: {
      participants: {
        where: { rank: 1 },
        include: {
          user: { select: { displayName: true, name: true } },
        },
      },
      _count: { select: { participants: true } },
    },
    orderBy: { endDate: "desc" },
    take: 10,
  });

  const pastChallengeData = [];
  for (const pc of pastChallenges) {
    pastChallengeData.push({
      id: pc.id,
      title: pc.title,
      type: pc.type,
      winner: pc.participants[0]
        ? {
            name: pc.participants[0].user.displayName ?? pc.participants[0].user.name ?? "Unknown",
            initials: getInitials(pc.participants[0].user.displayName ?? pc.participants[0].user.name),
          }
        : null,
      participants: pc._count.participants,
      endedAt: pc.endDate.toISOString(),
    });
  }

  // Build feed from recent crew activity
  const uidSet = new Set(memberIds);

  const recentWorkouts = await prisma.workout.findMany({
    where: {
      userId: { in: memberIds },
    },
    orderBy: { startTime: "desc" },
    take: 20,
    include: {
      user: { select: { displayName: true, name: true, image: true } },
      exercises: { include: { sets: true } },
    },
  });

  const recentBadges = await prisma.userBadge.findMany({
    where: {
      userId: { in: memberIds },
    },
    orderBy: { earnedAt: "desc" },
    take: 5,
    include: {
      user: { select: { displayName: true, name: true, image: true } },
      badge: true,
    },
  });

  const recentJoins = await prisma.challengeParticipant.findMany({
    where: {
      userId: { in: memberIds },
    },
    orderBy: { joinedAt: "desc" },
    take: 5,
    include: {
      user: { select: { displayName: true, name: true, image: true } },
      challenge: { select: { title: true } },
    },
  });

  // Merge and sort feed items
  interface FeedItem {
    id: string;
    type: string;
    user: { name: string; avatar: string | null; initials: string };
    workout?: string;
    volume?: number;
    prs?: number;
    badge?: string;
    badgeIcon?: string;
    challenge?: string;
    time: string;
    timestamp: number;
  }

  const feedItems: FeedItem[] = [];

  for (const w of recentWorkouts) {
    let volume = 0;
    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (s.weightKg && s.reps) volume += s.weightKg * s.reps;
      }
    }
    feedItems.push({
      id: `w-${w.id}`,
      type: "workout",
      user: {
        name: w.user.displayName ?? w.user.name ?? "Unknown",
        avatar: w.user.image,
        initials: getInitials(w.user.displayName ?? w.user.name),
      },
      workout: w.title,
      volume,
      prs: 0,
      time: getRelativeTime(w.startTime),
      timestamp: w.startTime.getTime(),
    });
  }

  for (const b of recentBadges) {
    feedItems.push({
      id: `b-${b.id}`,
      type: "badge",
      user: {
        name: b.user.displayName ?? b.user.name ?? "Unknown",
        avatar: b.user.image,
        initials: getInitials(b.user.displayName ?? b.user.name),
      },
      badge: b.badge.name,
      badgeIcon: b.badge.icon,
      time: getRelativeTime(b.earnedAt),
      timestamp: b.earnedAt.getTime(),
    });
  }

  for (const j of recentJoins) {
    feedItems.push({
      id: `j-${j.id}`,
      type: "challenge_join",
      user: {
        name: j.user.displayName ?? j.user.name ?? "Unknown",
        avatar: j.user.image,
        initials: getInitials(j.user.displayName ?? j.user.name),
      },
      challenge: j.challenge.title,
      time: getRelativeTime(j.joinedAt),
      timestamp: j.joinedAt.getTime(),
    });
  }

  feedItems.sort((a, b) => b.timestamp - a.timestamp);
  const feed = feedItems.slice(0, 15).map(({ timestamp, ...rest }) => rest);

  return NextResponse.json({
    id: crew.id,
    name: crew.name,
    description: crew.description,
    avatar: crew.avatar,
    privacy: crew.privacy,
    inviteCode: crew.inviteCode,
    memberCount: crew._count.members,
    myRole: membership.role,
    createdAt: crew.createdAt.toISOString(),
    owner: crew.owner,
    members,
    activeChallenge: challengeData,
    pastChallenges: pastChallengeData,
    feed,
  });
}

// ── Helpers ──

// ── Helpers ──

/** PATCH /api/crews/[id] — Edit crew (owner only) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, description, privacy } = await req.json();

  // Verify ownership
  const crew = await prisma.crew.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!crew) {
    return NextResponse.json({ error: "Crew not found" }, { status: 404 });
  }

  if (crew.ownerId !== session.user.id) {
    return NextResponse.json(
      { error: "Only the crew owner can edit" },
      { status: 403 },
    );
  }

  const data: Record<string, string> = {};
  if (name?.trim()) data.name = name.trim();
  if (description !== undefined) data.description = description?.trim() || "";
  if (privacy && ["PUBLIC", "INVITE_ONLY", "PRIVATE"].includes(privacy)) {
    data.privacy = privacy;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  await prisma.crew.update({ where: { id }, data });

  return NextResponse.json({ success: true });
}

/** DELETE /api/crews/[id] — Delete crew (owner only) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const crew = await prisma.crew.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!crew) {
    return NextResponse.json({ error: "Crew not found" }, { status: 404 });
  }

  if (crew.ownerId !== session.user.id) {
    return NextResponse.json(
      { error: "Only the crew owner can delete" },
      { status: 403 },
    );
  }

  await prisma.crew.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
