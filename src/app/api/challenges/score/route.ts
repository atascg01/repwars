import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { scoreChallenge, completeExpiredChallenges } from "@/services/challengeScoring";

/**
 * POST /api/challenges/score — Score challenges
 *   ?challengeId=X → score a specific challenge
 *   ?complete=true → complete all expired challenges
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const challengeId = searchParams.get("challengeId");
  const complete = searchParams.get("complete");

  try {
    if (challengeId) {
      const count = await scoreChallenge(challengeId);
      return NextResponse.json({ scored: count });
    }

    if (complete === "true") {
      const count = await completeExpiredChallenges();
      return NextResponse.json({ completed: count });
    }

    return NextResponse.json(
      { error: "Specify challengeId or complete=true" },
      { status: 400 },
    );
  } catch (err) {
    console.error("Score error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scoring failed" },
      { status: 500 },
    );
  }
}
