import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasDiscordId: !!process.env.AUTH_DISCORD_ID,
      hasDiscordSecret: !!process.env.AUTH_DISCORD_SECRET,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      authUrl: process.env.AUTH_URL,
    },
  });
}
