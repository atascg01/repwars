import { prisma } from "./src/lib/prisma";
import { generateInviteCode } from "./src/lib/utils";

async function testAll() {
  console.log("=== RepWars Integration Test ===\n");

  // Get the first user
  const user = await prisma.user.findFirst();
  if (!user) { console.log("❌ No users found"); return; }
  console.log(`✅ User: ${user.displayName ?? user.name} (${user.id})`);

  // Check workouts
  const workoutCount = await prisma.workout.count({ where: { userId: user.id } });
  console.log(`✅ Workouts: ${workoutCount}`);

  // Check crews
  let crew = await prisma.crew.findFirst({ where: { ownerId: user.id } });
  if (!crew) {
    crew = await prisma.crew.create({
      data: {
        name: "Test Crew",
        description: "Auto-created test crew",
        ownerId: user.id,
        inviteCode: generateInviteCode(),
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });
    console.log(`✅ Created crew: ${crew.name} (${crew.id})`);
  } else {
    console.log(`✅ Crew exists: ${crew.name}`);
  }

  // Check if user is a member
  const membership = await prisma.crewMember.findUnique({
    where: { crewId_userId: { crewId: crew.id, userId: user.id } },
  });
  console.log(`✅ Membership: ${membership?.role ?? "none"}`);

  // Check challenges
  const challengeCount = await prisma.challenge.count({ where: { crewId: crew.id } });
  console.log(`✅ Challenges in crew: ${challengeCount}`);

  // Create a challenge if none exist and there are workouts
  if (challengeCount === 0 && workoutCount > 0) {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 86400000);
    const challenge = await prisma.challenge.create({
      data: {
        crewId: crew.id,
        createdById: user.id,
        type: "IRON_KING",
        title: "Iron King — Week 1",
        description: "Highest total volume this week",
        startDate: now,
        endDate: weekEnd,
        status: "ACTIVE",
        participants: { create: { userId: user.id } },
      },
    });
    console.log(`✅ Created challenge: ${challenge.title}`);
  }

  console.log("\n=== All tests passed ===");
}

testAll().catch((e) => console.error("❌", e.message)).finally(() => prisma.$disconnect());
