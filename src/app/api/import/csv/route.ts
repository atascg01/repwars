import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { parseHevyCsv } from "@/services/csvParser";
import { seedBadges, checkBadges } from "@/services/badgeService";

/**
 * POST /api/import/csv
 * Upload Hevy CSV, parse it, and store workouts.
 * Deduplicates by (userId, hevyWorkoutId) or by (userId, title, startTime).
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const csvText = await file.text();
  const parsed = parseHevyCsv(csvText);

  if (!parsed.length) {
    return NextResponse.json({ error: "No workouts found in CSV" }, { status: 400 });
  }

  let imported = 0;
  let skipped = 0;

  for (const pw of parsed) {
    // Dedup: check if this exact workout exists
    const existing = await prisma.workout.findFirst({
      where: {
        userId: session.user.id,
        title: pw.title,
        startTime: pw.startTime,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.workout.create({
      data: {
        userId: session.user.id,
        source: "csv",
        title: pw.title,
        startTime: pw.startTime,
        endTime: pw.endTime,
        exercises: {
          create: pw.exercises.map((ex, ei) => ({
            title: ex.title,
            sortOrder: ei,
            sets: {
              create: [{
                setType: ex.setType,
                weightKg: ex.weightKg,
                reps: ex.reps,
                durationSeconds: ex.durationSeconds,
                distanceMeters: ex.distanceMeters,
              }],
            },
          })),
        },
      },
    });

    // Update user's total volume
    const sessionVolume = pw.exercises.reduce((sum, ex) => {
      if (ex.weightKg && ex.reps) return sum + ex.weightKg * ex.reps;
      return sum;
    }, 0);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalVolumeLifted: { increment: sessionVolume },
        lastWorkoutDate: pw.endTime,
      },
    });

    imported++;
  }

  // Check badges after import
  if (imported > 0) {
    try {
      await seedBadges();
      await checkBadges(session.user.id);
    } catch (err) {
      console.error("Badge check failed:", err);
    }
  }

  return NextResponse.json({
    imported,
    skipped,
    total: parsed.length,
  });
}
