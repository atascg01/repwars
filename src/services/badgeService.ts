import { prisma } from "@/lib/prisma";
import { BadgeCategory } from "@prisma/client";

const BADGE_DEFINITIONS = [
  // ── Streak Badges ────────────────────────────
  { name: "First Week", description: "7-day workout streak", icon: "🔥", category: "STREAK" as const, requirement: "streak:7" },
  { name: "Monthly Grinder", description: "30-day workout streak", icon: "🔥🔥", category: "STREAK" as const, requirement: "streak:30" },
  { name: "Unstoppable", description: "90-day workout streak", icon: "💀🔥", category: "STREAK" as const, requirement: "streak:90" },
  { name: "Year of the Beast", description: "365-day workout streak", icon: "👑🔥", category: "STREAK" as const, requirement: "streak:365" },

  // ── Volume Badges ────────────────────────────
  { name: "One Ton", description: "Lifted 1,000 kg total", icon: "🪨", category: "VOLUME" as const, requirement: "volume:1000" },
  { name: "Ten Tons", description: "Lifted 10,000 kg total", icon: "🏗️", category: "VOLUME" as const, requirement: "volume:10000" },
  { name: "Hundred Tons", description: "Lifted 100,000 kg total", icon: "🚢", category: "VOLUME" as const, requirement: "volume:100000" },
  { name: "Megaton", description: "Lifted 1,000,000 kg total", icon: "🌋", category: "VOLUME" as const, requirement: "volume:1000000" },

  // ── PR Badges ────────────────────────────────
  { name: "First PR", description: "Broke your first personal record", icon: "⚡", category: "PR" as const, requirement: "prs:1" },
  { name: "PR Machine", description: "Broke 10 personal records", icon: "⚡⚡", category: "PR" as const, requirement: "prs:10" },
  { name: "Record Breaker", description: "Broke 50 personal records", icon: "💥", category: "PR" as const, requirement: "prs:50" },

  // ── Challenge Badges ─────────────────────────
  { name: "Iron King", description: "Won an Iron King challenge", icon: "🏆", category: "CHALLENGE" as const, requirement: "challenge:iron_king:win:1" },
  { name: "Iron Dynasty", description: "Won 5 Iron King challenges", icon: "🏆👑", category: "CHALLENGE" as const, requirement: "challenge:iron_king:win:5" },
  { name: "Consistent", description: "Won a Consistency challenge", icon: "📅", category: "CHALLENGE" as const, requirement: "challenge:consistency:win:1" },
  { name: "PR Hunter", description: "Won a PR Breaker challenge", icon: "🎯", category: "CHALLENGE" as const, requirement: "challenge:pr_breaker:win:1" },
  { name: "Grinder", description: "Won a Grinder challenge", icon: "💪", category: "CHALLENGE" as const, requirement: "challenge:grinder:win:1" },
  { name: "Challenge Starter", description: "Created your first challenge", icon: "🚀", category: "CHALLENGE" as const, requirement: "challenge:created:1" },

  // ── Rarity Badges ────────────────────────────
  { name: "Early Adopter", description: "Joined during launch week", icon: "🥇", category: "RARITY" as const, requirement: null },
  { name: "Night Owl", description: "Workout logged between 2-4 AM", icon: "🦉", category: "RARITY" as const, requirement: null },
  { name: "Globetrotter", description: "Workout logged on 3+ continents", icon: "🌍", category: "RARITY" as const, requirement: null },

  // ── Community Badges ─────────────────────────
  { name: "Crew Founder", description: "Created a crew", icon: "🏴‍☠️", category: "COMMUNITY" as const, requirement: "crew:created:1" },
  { name: "Social Butterfly", description: "Member of 5+ crews", icon: "🦋", category: "COMMUNITY" as const, requirement: "crew:member:5" },
  { name: "Verified Lifter", description: "Connected via Hevy API (trusted data)", icon: "✅", category: "COMMUNITY" as const, requirement: null },
];

/**
 * Seed badges into the database (idempotent - skips existing).
 */
export async function seedBadges() {
  for (const badge of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      create: badge,
      update: {},
    });
  }
}

/**
 * Check and award badges for a user based on their current stats.
 * Call this after syncing data or completing a challenge.
 */
export async function checkBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userBadges: { include: { badge: true } },
      workouts: { include: { exercises: { include: { sets: true } } } },
    },
  });
  if (!user) return [];

  const existingBadgeNames = new Set(user.userBadges.map((ub) => ub.badge.name));
  const newBadges: string[] = [];

  // ── Streak checks ────────────────────────────
  const streakBadges = [
    { name: "First Week", threshold: 7 },
    { name: "Monthly Grinder", threshold: 30 },
    { name: "Unstoppable", threshold: 90 },
    { name: "Year of the Beast", threshold: 365 },
  ];

  if (user.currentStreak > 0) {
    for (const sb of streakBadges) {
      if (user.currentStreak >= sb.threshold && !existingBadgeNames.has(sb.name)) {
        await awardBadge(userId, sb.name);
        newBadges.push(sb.name);
      }
    }
  }

  // ── Volume checks ────────────────────────────
  const volumeBadges = [
    { name: "One Ton", threshold: 1000 },
    { name: "Ten Tons", threshold: 10000 },
    { name: "Hundred Tons", threshold: 100000 },
    { name: "Megaton", threshold: 1000000 },
  ];

  for (const vb of volumeBadges) {
    if (user.totalVolumeLifted >= vb.threshold && !existingBadgeNames.has(vb.name)) {
      await awardBadge(userId, vb.name);
      newBadges.push(vb.name);
    }
  }

  // ── Crew founder ─────────────────────────────
  const crewCount = await prisma.crew.count({ where: { ownerId: userId } });
  if (crewCount > 0 && !existingBadgeNames.has("Crew Founder")) {
    await awardBadge(userId, "Crew Founder");
    newBadges.push("Crew Founder");
  }

  return newBadges;
}

async function awardBadge(userId: string, badgeName: string) {
  const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
  if (!badge) return;
  await prisma.userBadge.create({
    data: { userId, badgeId: badge.id },
  });
}
