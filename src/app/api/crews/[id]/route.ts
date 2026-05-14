import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
              image: true,
              currentStreak: true,
              totalVolumeLifted: true,
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
              user: { select: { id: true, displayName: true, image: true } },
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

  // Build members array
  const members = [];
  for (const m of crew.members) {
    const workoutCount = await prisma.workout.count({
      where: { userId: m.user.id },
    });

    members.push({
      name: m.user.displayName ?? "Unknown",
      initials: getInitials(m.user.displayName),
      role: m.role,
      streak: m.user.currentStreak,
      volume: m.user.totalVolumeLifted,
      workouts: workoutCount,
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
        name: p.user.displayName ?? "Unknown",
        initials: getInitials(p.user.displayName),
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
          user: { select: { displayName: true } },
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
            name: pc.participants[0].user.displayName ?? "Unknown",
            initials: getInitials(pc.participants[0].user.displayName),
          }
        : null,
      participants: pc._count.participants,
      endedAt: pc.endDate.toISOString(),
    });
  }

  // Build feed from recent crew activity
  const memberIds = crew.members.map((m) => m.user.id);

  const recentWorkouts = await prisma.workout.findMany({
    where: {
      userId: { in: memberIds },
    },
    orderBy: { startTime: "desc" },
    take: 20,
    include: {
      user: { select: { displayName: true, image: true } },
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
      user: { select: { displayName: true, image: true } },
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
      user: { select: { displayName: true, image: true } },
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
        name: w.user.displayName ?? "Unknown",
        avatar: w.user.image,
        initials: getInitials(w.user.displayName),
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
        name: b.user.displayName ?? "Unknown",
        avatar: b.user.image,
        initials: getInitials(b.user.displayName),
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
        name: j.user.displayName ?? "Unknown",
        avatar: j.user.image,
        initials: getInitials(j.user.displayName),
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
