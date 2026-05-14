import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/crews — List user's crews */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.crewMember.findMany({
    where: { userId: session.user.id },
    include: {
      crew: {
        include: {
          _count: { select: { members: true } },
          owner: { select: { id: true, displayName: true, image: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const crews = [];
  for (const m of memberships) {
    crews.push({
      id: m.crew.id,
      name: m.crew.name,
      description: m.crew.description,
      avatar: m.crew.avatar,
      privacy: m.crew.privacy,
      inviteCode: m.crew.inviteCode,
      memberCount: m.crew._count.members,
      myRole: m.role,
      owner: m.crew.owner,
    });
  }

  return NextResponse.json({ crews });
}

/** POST /api/crews — Create a new crew */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, privacy = "INVITE_ONLY" } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const crew = await prisma.crew.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      privacy,
      inviteCode: generateInviteCode(),
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
    },
  });

  return NextResponse.json({ crew }, { status: 201 });
}
