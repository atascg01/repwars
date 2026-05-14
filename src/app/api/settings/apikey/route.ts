import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { syncHevyWorkouts } from "@/services/hevySync";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/settings/apikey — Save encrypted Hevy API key
 * GET  /api/settings/apikey — Check if API key exists (returns masked)
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { apiKey } = await req.json();
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "API key is required" },
      { status: 400 }
    );
  }

  const plainKey = apiKey.trim();
  const encrypted = await encrypt(plainKey);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { hevyApiKeyEncrypted: encrypted },
  });

  // Trigger an initial sync so the user sees their data immediately
  let syncResult: { imported: number; skipped: number } | null = null;
  try {
    syncResult = await syncHevyWorkouts(session.user.id, plainKey);
  } catch (err) {
    console.error("Initial Hevy sync failed:", err);
    // Don't fail the save if sync fails — key is still saved
  }

  return NextResponse.json({ success: true, sync: syncResult });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hevyApiKeyEncrypted: true },
  });

  return NextResponse.json({
    hasApiKey: !!user?.hevyApiKeyEncrypted,
  });
}

