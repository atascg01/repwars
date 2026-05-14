"use client";

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
} from "lucide-react";

const challengeTypeMeta = {
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

const challenge = {
  id: "c1",
  crewName: "Iron Brotherhood",
  crewId: "1",
  type: "IRON_KING" as const,
  title: "Iron King — Week 20",
  description: "Who lifts the most this week? Total volume across all exercises. Every rep counts.",
  startDate: "2026-05-11",
  endDate: "2026-05-17",
  status: "active",
  participants: 12,
  leaderboard: [
    { rank: 1, trend: "up", name: "Andress", initials: "AN", score: 84200, change: 5200, workouts: 4 },
    { rank: 2, trend: "down", name: "María", initials: "MA", score: 76100, change: -3100, workouts: 5 },
    { rank: 3, trend: "up", name: "Carlos", initials: "CR", score: 58900, change: 12000, workouts: 3 },
    { rank: 4, trend: "same", name: "Pablo", initials: "PB", score: 45200, change: 0, workouts: 3 },
    { rank: 5, trend: "up", name: "Diego", initials: "DG", score: 31200, change: 8900, workouts: 2 },
    { rank: 6, trend: "down", name: "Laura", initials: "LA", score: 18700, change: -2100, workouts: 2 },
    { rank: 7, trend: "same", name: "Sofía", initials: "SF", score: 15400, change: 0, workouts: 1 },
    { rank: 8, trend: "new", name: "Javier", initials: "JV", score: 12200, change: null, workouts: 2 },
    { rank: 9, trend: "same", name: "Ana", initials: "AA", score: 8100, change: 0, workouts: 1 },
    { rank: 10, trend: "down", name: "Miguel", initials: "MG", score: 5400, change: -800, workouts: 1 },
    { rank: 11, trend: "same", name: "Elena", initials: "EL", score: 3200, change: 0, workouts: 1 },
    { rank: 12, trend: "new", name: "Tomás", initials: "TM", score: 1800, change: null, workouts: 1 },
  ],
};

export default function ChallengeDetailPage() {
  const meta = challengeTypeMeta[challenge.type];
  const Icon = meta.icon;
  const podium = challenge.leaderboard.slice(0, 3);

  return (
    <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Back */}
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
            <div
              className={`h-16 w-16 rounded-2xl ${meta.bg} flex items-center justify-center shrink-0`}
            >
              <Icon className={`h-8 w-8 ${meta.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${meta.bg} ${meta.color} border-0`}>
                  {meta.label}
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-400 border-0 animate-pulse">
                  Live
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mt-1.5">
                {challenge.title}
              </h1>
              <p className="text-zinc-500 mt-1 max-w-lg">{challenge.description}</p>
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
            label="Ends In"
            value="3d 14h"
            highlight
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

      {/* Podium */}
      <div className="relative">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="flex items-end justify-center gap-3 sm:gap-6 px-4 pt-8 pb-4">
          {/* 2nd Place */}
          <PodiumSpot
            rank={2}
            participant={podium[1]}
            height="h-28 sm:h-36"
            color="bg-zinc-400"
            textColor="text-zinc-300"
            delay="delay-100"
          />

          {/* 1st Place */}
          <PodiumSpot
            rank={1}
            participant={podium[0]}
            height="h-36 sm:h-44"
            color="bg-amber-500"
            textColor="text-amber-300"
            delay="delay-0"
            isWinner
          />

          {/* 3rd Place */}
          <PodiumSpot
            rank={3}
            participant={podium[2]}
            height="h-24 sm:h-28"
            color="bg-amber-800"
            textColor="text-amber-500"
            delay="delay-200"
          />
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      {/* Full Leaderboard */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Medal className="h-5 w-5 text-amber-400" />
          Full Leaderboard
        </h2>

        <Card className="border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-3 text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800 bg-zinc-900">
            <span className="w-8 text-center">#</span>
            <span>Athlete</span>
            <span className="text-right w-24">{meta.unit}</span>
            <span className="text-right w-16">Trend</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-zinc-800">
            {challenge.leaderboard.map((p, i) => {
              const isMe = p.name === "Andress";
              const trendIcon =
                p.trend === "up" ? (
                  <ChevronUp className="h-3 w-3 text-emerald-400" />
                ) : p.trend === "down" ? (
                  <ChevronDown className="h-3 w-3 text-red-400" />
                ) : (
                  <Minus className="h-3 w-3 text-zinc-600" />
                );
              const trendColor =
                p.trend === "up"
                  ? "text-emerald-400"
                  : p.trend === "down"
                  ? "text-red-400"
                  : "text-zinc-600";

              return (
                <div
                  key={p.name}
                  className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-3.5 items-center transition-colors ${
                    isMe
                      ? "bg-amber-500/5 border-l-2 border-l-amber-500"
                      : "hover:bg-zinc-900/50"
                  }`}
                >
                  {/* Rank */}
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
                    {p.rank === 1 ? "👑" : p.rank}
                  </span>

                  {/* Athlete */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className={`text-xs font-semibold ${
                          isMe
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
                            isMe ? "text-amber-400" : "text-white"
                          }`}
                        >
                          {p.name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] text-zinc-600">(you)</span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-600">
                        {p.workouts} workout{p.workouts !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="text-sm font-bold tabular-nums">
                      {p.score.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-zinc-600 ml-1">
                      {meta.unit}
                    </span>
                  </div>

                  {/* Trend */}
                  <div className="flex items-center justify-end gap-1 w-16">
                    <span
                      className={`flex items-center gap-0.5 text-xs font-medium tabular-nums ${trendColor}`}
                    >
                      {p.change !== null && p.change !== 0
                        ? `${p.change > 0 ? "+" : ""}${p.change.toLocaleString()}`
                        : p.trend === "new"
                        ? "NEW"
                        : "—"}
                    </span>
                    {p.trend !== "new" && trendIcon}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* My Stats Card */}
      <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-amber-500/20 text-amber-400 font-bold">
                  AN
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">My Progress</p>
                <p className="text-sm text-zinc-500">
                  You're ranked #1 with 4 workouts this week
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-amber-400 tabular-nums">
                84,200
              </p>
              <p className="text-xs text-zinc-500">total kg</p>
            </div>
          </div>
        </CardContent>
      </Card>
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
  participant: (typeof challenge.leaderboard)[0];
  height: string;
  color: string;
  textColor: string;
  delay: string;
  isWinner?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500">
      {/* Avatar */}
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

      {/* Name */}
      <span className="text-sm font-semibold text-center leading-tight">
        {participant.name}
      </span>

      {/* Score on podium */}
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

      {/* Rank badge */}
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
