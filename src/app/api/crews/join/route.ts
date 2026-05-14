import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/** POST /api/crews/join — Join a crew by invite code */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteCode } = await req.json();
  if (!inviteCode?.trim()) {
    return NextResponse.json(
      { error: "Invite code is required" },
      { status: 400 }
    );
  }

  const crew = await prisma.crew.findUnique({
    where: { inviteCode: inviteCode.trim().toUpperCase() },
  });

  if (!crew) {
    return NextResponse.json({ error: "Crew not found" }, { status: 404 });
  }

  // Check if already a member
  const existing = await prisma.crewMember.findUnique({
    where: {
      crewId_userId: {
        crewId: crew.id,
        userId: session.user.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Already a member of this crew" },
      { status: 409 }
    );
  }

  const membership = await prisma.crewMember.create({
    data: {
      crewId: crew.id,
      userId: session.user.id,
      role: "MEMBER",
    },
    include: {
      crew: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
  });

  return NextResponse.json(
    {
      crew: {
        id: membership.crew.id,
        name: membership.crew.name,
        description: membership.crew.description,
        avatar: membership.crew.avatar,
        privacy: membership.crew.privacy,
        inviteCode: membership.crew.inviteCode,
        memberCount: membership.crew._count.members,
        myRole: membership.role,
      },
    },
    { status: 201 }
  );
}
