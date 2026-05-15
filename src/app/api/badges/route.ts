import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [allBadges, earnedBadges] = await Promise.all([
    prisma.badge.findMany({ orderBy: { category: "asc" } }),
    prisma.userBadge.findMany({
      where: { userId: session.user.id },
      select: { badgeId: true, earnedAt: true },
    }),
  ]);

  const earnedMap = new Map(
    earnedBadges.map((b) => [b.badgeId, b.earnedAt]),
  );

  const badges = allBadges.map((badge) => ({
    ...badge,
    earned: earnedMap.has(badge.id),
    earnedAt: earnedMap.get(badge.id)?.toISOString() ?? null,
  }));

  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  return NextResponse.json({ earned, locked, total: badges.length });
}
