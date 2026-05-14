"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Swords,
  Trophy,
  Clock,
  Users,
  Medal,
  Weight,
  Zap,
  Flame,
  CalendarDays,
  Target,
  ChevronUp,
  ChevronDown,
  Minus,
  Crown,
  Share2,
  Loader2,
} from "lucide-react";

// ── Type metadata ──

const challengeTypeMeta: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bg: string;
  border: string;
  unit: string;
  desc: string;
}> = {
  IRON_KING: {
    icon: Weight,
    label: "Iron King",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    unit: "kg",
    desc: "Total volume lifted",
  },
  CONSISTENCY: {
    icon: CalendarDays,
    label: "Consistency",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    unit: "workouts",
    desc: "Workout days logged",
  },
  PR_BREAKER: {
    icon: Zap,
    label: "PR Breaker",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    unit: "PRs",
    desc: "Personal records broken",
  },
  GRINDER: {
    icon: Flame,
    label: "Grinder",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    unit: "kg",
    desc: "Highest single-session volume",
  },
  CUSTOM: {
    icon: Target,
    label: "Custom",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    unit: "kg",
    desc: "Exercise-specific",
  },
};

interface LeaderboardEntry {
  rank: number | null;
  name: string;
  initials: string;
  score: number;
  workouts: number;
  avatar: string | null;
  isMe: boolean;
}

interface ChallengeDetail {
  id: string;
  crewId: string;
  crewName: string;
  type: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  participants: number;
  leaderboard: LeaderboardEntry[];
}

// ── Page ──

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch(`/api/challenges/${id}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Failed to load challenge");
          return;
        }
        const data = await res.json();
        setChallenge(data);
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-8 flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </main>
    );
  }

  if (error || !challenge) {
    return (
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
        <Link
          href="/dashboard/challenges"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Challenges
        </Link>
        <div className="rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-500 text-lg">{error || "Challenge not found"}</p>
        </div>
      </main>
    );
  }

  const meta = challengeTypeMeta[challenge.type];
  if (!meta) return null;
  const Icon = meta.icon;
  const podium = challenge.leaderboard.slice(0, 3);
  const timeLeft = getTimeLeft(challenge.endDate);
  const isActive = challenge.status === "ACTIVE" || challenge.status === "UPCOMING";

  return (
    <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
      <Link
        href="/dashboard/challenges"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Challenges
      </Link>

      {/* Challenge Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl ${meta.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-8 w-8 ${meta.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${meta.bg} ${meta.color} border-0`}>
                  {meta.label}
                </Badge>
                {isActive && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-0 animate-pulse">
                    Live
                  </Badge>
                )}
                {challenge.status === "COMPLETED" && (
                  <Badge className="bg-zinc-700 text-zinc-400 border-0">
                    Completed
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight mt-1.5">
                {challenge.title}
              </h1>
              <p className="text-zinc-500 mt-1 max-w-lg">
                {challenge.description ?? "No description"}
              </p>
              <p className="text-xs text-zinc-600 mt-2">
                {challenge.crewName}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBadge
            icon={<Swords className="h-4 w-4" />}
            label="Type"
            value={meta.label}
          />
          <StatBadge
            icon={<Clock className="h-4 w-4" />}
            label={isActive ? "Ends In" : "Ended"}
            value={timeLeft}
            highlight={isActive}
          />
          <StatBadge
            icon={<Users className="h-4 w-4" />}
            label="Participants"
            value={String(challenge.participants)}
          />
          <StatBadge
            icon={<Trophy className="h-4 w-4" />}
            label="Scoring"
            value={meta.desc}
          />
        </div>
      </div>

      {/* Podium (for active challenges) */}
      {isActive && podium.length >= 3 && (
        <>
          <div className="relative">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <div className="flex items-end justify-center gap-3 sm:gap-6 px-4 pt-8 pb-4">
              {podium[1] && (
                <PodiumSpot
                  rank={2}
                  participant={podium[1]}
                  height="h-28 sm:h-36"
                  color="bg-zinc-400"
                  textColor="text-zinc-300"
                  delay="delay-100"
                />
              )}
              {podium[0] && (
                <PodiumSpot
                  rank={1}
                  participant={podium[0]}
                  height="h-36 sm:h-44"
                  color="bg-amber-500"
                  textColor="text-amber-300"
                  delay="delay-0"
                  isWinner
                />
              )}
              {podium[2] && (
                <PodiumSpot
                  rank={3}
                  participant={podium[2]}
                  height="h-24 sm:h-28"
                  color="bg-amber-800"
                  textColor="text-amber-500"
                  delay="delay-200"
                />
              )}
            </div>
          </div>
          <Separator className="bg-zinc-800" />
        </>
      )}

      {/* Full Leaderboard */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Medal className="h-5 w-5 text-amber-400" />
          Full Leaderboard
        </h2>

        <Card className="border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-5 py-3 text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800 bg-zinc-900">
            <span className="w-8 text-center">#</span>
            <span>Athlete</span>
            <span className="text-right w-32">{meta.unit}</span>
          </div>

          <div className="divide-y divide-zinc-800">
            {challenge.leaderboard.map((p, i) => {
              return (
                <div
                  key={p.name}
                  className={`grid grid-cols-[auto_1fr_auto] gap-4 px-5 py-3.5 items-center transition-colors ${
                    p.isMe
                      ? "bg-amber-500/5 border-l-2 border-l-amber-500"
                      : "hover:bg-zinc-900/50"
                  }`}
                >
                  <span
                    className={`w-8 text-center font-bold text-sm ${
                      p.rank === 1
                        ? "text-amber-400"
                        : p.rank === 2
                        ? "text-zinc-300"
                        : p.rank === 3
                        ? "text-amber-600"
                        : "text-zinc-500"
                    }`}
                  >
                    {p.rank === 1 ? "👑" : p.rank ?? "-"}
                  </span>

                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className={`text-xs font-semibold ${
                          p.isMe
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {p.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm font-semibold truncate ${
                            p.isMe ? "text-amber-400" : "text-white"
                          }`}
                        >
                          {p.name}
                        </span>
                        {p.isMe && (
                          <span className="text-[10px] text-zinc-600">(you)</span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-600">
                        {p.workouts} workout{p.workouts !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold tabular-nums">
                      {p.score.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-zinc-600 ml-1">
                      {meta.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </main>
  );
}

function PodiumSpot({
  rank,
  participant,
  height,
  color,
  textColor,
  delay,
  isWinner,
}: {
  rank: number;
  participant: LeaderboardEntry;
  height: string;
  color: string;
  textColor: string;
  delay: string;
  isWinner?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="relative">
        {isWinner && (
          <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 h-5 w-5 text-amber-400 animate-bounce" />
        )}
        <Avatar className={`h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-offset-2 ring-offset-zinc-950 ${color.replace("bg-", "ring-")}`}>
          <AvatarFallback className={`text-sm font-bold ${color} text-black`}>
            {participant.initials}
          </AvatarFallback>
        </Avatar>
      </div>
      <span className="text-sm font-semibold text-center leading-tight">
        {participant.name}
      </span>
      <div
        className={`${height} w-20 sm:w-24 ${color} rounded-t-lg flex flex-col items-center justify-end pb-3 transition-all duration-700 ${delay}`}
      >
        <span className="text-black font-black text-lg sm:text-xl tabular-nums">
          {participant.score.toLocaleString()}
        </span>
        <span className="text-black/60 text-[10px]">
          {participant.workouts} workouts
        </span>
      </div>
      <div
        className={`h-8 w-8 rounded-full ${color} flex items-center justify-center text-black font-black text-sm -mt-4 ring-4 ring-zinc-950 z-10`}
      >
        {rank}
      </div>
    </div>
  );
}

function StatBadge({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <div className={`${highlight ? "text-amber-400" : "text-zinc-500"}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
          {label}
        </p>
        <p className={`text-sm font-semibold ${highlight ? "text-amber-400" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function getTimeLeft(endDateStr: string): string {
  const end = new Date(endDateStr).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}
