import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const encrypted = await encrypt(apiKey.trim());

  await prisma.user.update({
    where: { id: session.user.id },
    data: { hevyApiKeyEncrypted: encrypted },
  });

  return NextResponse.json({ success: true });
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

// ── Simple encryption using Web Crypto ──

async function encrypt(text: string): Promise<string> {
  // Derive encryption key from env secret (or a fallback for dev)
  const secret = process.env.ENCRYPTION_KEY ?? "hevy-social-mvp-default-key-min-32-ch!!";
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret).slice(0, 32),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    keyMaterial,
    encoder.encode(text)
  );

  // Return iv + ciphertext as hex
  const ivHex = Array.from(iv)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const ctHex = Array.from(new Uint8Array(encrypted))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${ivHex}:${ctHex}`;
}
