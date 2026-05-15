import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET  /api/settings/profile — Get user profile settings
 * PATCH /api/settings/profile — Update display name, unit preference
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      displayName: true,
      name: true,
      unitPreference: true,
      weeklyStreakTarget: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    email: user.email,
    displayName: user.displayName ?? user.name,
    unitPreference: user.unitPreference,
    weeklyStreakTarget: user.weeklyStreakTarget,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { displayName, unitPreference } = await req.json();

  const data: Record<string, string> = {};
  if (displayName !== undefined) data.displayName = String(displayName).trim();
  if (unitPreference && ["kg", "lbs"].includes(unitPreference)) {
    data.unitPreference = unitPreference;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  return NextResponse.json({ success: true });
}
