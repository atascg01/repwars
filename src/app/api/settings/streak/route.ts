import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/settings/streak — Update weekly streak target (1-7)
 * GET  /api/settings/streak — Get current streak target
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { weeklyStreakTarget: true },
  });

  return NextResponse.json({
    weeklyStreakTarget: user?.weeklyStreakTarget ?? 3,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weeklyStreakTarget } = await req.json();
  const target = parseInt(String(weeklyStreakTarget), 10);

  if (isNaN(target) || target < 1 || target > 7) {
    return NextResponse.json(
      { error: "Target must be between 1 and 7" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { weeklyStreakTarget: target },
  });

  return NextResponse.json({ weeklyStreakTarget: target });
}
