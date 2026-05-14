import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { syncHevyWorkouts } from "@/services/hevySync";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/sync — Manually trigger a Hevy API sync
 */
export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hevyApiKeyEncrypted: true },
  });

  if (!user?.hevyApiKeyEncrypted) {
    return NextResponse.json(
      { error: "No Hevy API key configured" },
      { status: 400 }
    );
  }

  let apiKey: string;
  try {
    apiKey = await decrypt(user.hevyApiKeyEncrypted);
  } catch {
    return NextResponse.json(
      { error: "Failed to decrypt API key" },
      { status: 500 }
    );
  }

  try {
    const result = await syncHevyWorkouts(session.user.id, apiKey);
    return NextResponse.json({
      success: true,
      imported: result.imported,
      skipped: result.skipped,
      total: result.imported + result.skipped,
    });
  } catch (err) {
    console.error("Sync failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
