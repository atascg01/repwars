"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Swords,
  Trophy,
  Dumbbell,
  Flame,
  Plus,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Target,
  Weight,
  CalendarDays,
  ChevronRight,
  Loader2,
} from "lucide-react";

// ── Type metadata ──

const challengeTypes: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
  unit: string;
}> = {
  IRON_KING: {
    icon: Weight,
    label: "Iron King",
    desc: "Highest total volume",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    unit: " kg",
  },
  CONSISTENCY: {
    icon: CalendarDays,
    label: "Consistency",
    desc: "Most workouts logged",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    unit: " workouts",
  },
  PR_BREAKER: {
    icon: Zap,
    label: "PR Breaker",
    desc: "Most personal records",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    unit: " PRs",
  },
  GRINDER: {
    icon: Flame,
    label: "Grinder",
    desc: "Highest single-session volume",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    unit: " kg",
  },
  CUSTOM: {
    icon: Target,
    label: "Custom",
    desc: "Exercise-specific",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    unit: "",
  },
};

interface ChallengeItem {
  id: string;
  crewName: string;
  type: string;
  title: string;
  leader: { name: string; initials: string; score: number } | null;
  participants: number;
  yourRank: number | null;
  yourScore: number;
  endDate?: string;
  winner?: { name: string; initials: string } | null;
  endedAt?: string;
}

// ── Page ──

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [active, setActive] = useState<ChallengeItem[]>([]);
  const [completed, setCompleted] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch("/api/challenges");
      if (res.ok) {
        const data = await res.json();
        setActive(data.active ?? []);
        setCompleted(data.completed ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch challenges:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return (
    <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
          <p className="text-zinc-500 mt-1">
            Compete. Climb. Conquer. Weekly battles with your crew.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Challenge
        </Button>
      </div>

      {/* Challenge Type Quick Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {Object.entries(challengeTypes).map(([key, type]) => {
          const Icon = type.icon;
          return (
            <div
              key={key}
              className={`rounded-xl border ${type.border} ${type.bg} p-4 text-center hover:scale-[1.02] transition-transform cursor-default`}
            >
              <Icon className={`h-6 w-6 mx-auto mb-2 ${type.color}`} />
              <p className="text-sm font-semibold">{type.label}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{type.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="active" className="gap-2">
            <Swords className="h-4 w-4" />
            Active
            {active.length > 0 && (
              <Badge className="ml-1 bg-amber-500/20 text-amber-400 border-0 h-5 px-1.5 text-[11px]">
                {active.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <Trophy className="h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
          ) : active.length === 0 ? (
            <EmptyState
              icon={<Swords className="h-12 w-12" />}
              title="No Active Challenges"
              description="Join an existing challenge or create a new one for your crew."
              action="New Challenge"
            />
          ) : (
            <div className="space-y-4">
              {active.map((ch) => {
                const meta = challengeTypes[ch.type];
                if (!meta) return null;
                const Icon = meta.icon;

                const endsIn = ch.endDate
                  ? getTimeLeft(ch.endDate)
                  : "?";

                return (
                  <Link key={ch.id} href={`/dashboard/challenges/${ch.id}`}>
                    <Card
                      className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all cursor-pointer group"
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
                              <Icon className={`h-6 w-6 ${meta.color}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-lg">{ch.title}</h3>
                                <Badge className={`${meta.bg} ${meta.color} border-0`}>
                                  {meta.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <div className="h-5 w-5 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                    {ch.crewName.charAt(0)}
                                  </div>
                                  {ch.crewName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {ch.participants}
                                </span>
                                <span className="flex items-center gap-1 text-amber-400">
                                  <Clock className="h-3 w-3" />
                                  {endsIn} left
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            {ch.leader && (
                              <div className="text-center">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                                  Leader
                                </p>
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="bg-amber-500/20 text-amber-400 text-[10px]">
                                      {ch.leader.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-semibold">
                                    {ch.leader.name}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-500">
                                  {ch.leader.score.toLocaleString()}
                                  {meta.unit}
                                </p>
                              </div>
                            )}

                            {ch.yourRank && (
                              <div className="text-center">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                                  You
                                </p>
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-2xl font-black tabular-nums">
                                    #{ch.yourRank}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-500">
                                  {ch.yourScore.toLocaleString()}
                                </p>
                              </div>
                            )}

                            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
          ) : completed.length === 0 ? (
            <EmptyState
              icon={<Trophy className="h-12 w-12" />}
              title="No Completed Challenges"
              description="Challenge history will appear here once you finish your first battle."
              action={null}
            />
          ) : (
            <div className="space-y-3">
              {completed.map((ch) => {
                const meta = challengeTypes[ch.type];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <Link key={ch.id} href={`/dashboard/challenges/${ch.id}`}>
                    <Card className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl ${meta.bg} flex items-center justify-center`}>
                              <Icon className={`h-5 w-5 ${meta.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold">{ch.title}</h3>
                                <Badge className={`${meta.bg} ${meta.color} border-0 text-[11px]`}>
                                  {meta.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-zinc-500">
                                {ch.crewName} · {ch.participants} participants
                                {ch.endedAt &&
                                  ` · Ended ${new Date(ch.endedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {ch.winner && (
                              <div className="text-right">
                                <p className="text-[10px] text-zinc-500 uppercase">Winner</p>
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="bg-amber-500/20 text-amber-400 text-[10px]">
                                      {ch.winner.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-semibold text-amber-400">
                                    {ch.winner.name}
                                  </span>
                                </div>
                              </div>
                            )}
                            {ch.yourRank !== null && (
                              <div className="text-center">
                                <p className="text-[10px] text-zinc-500 uppercase">You</p>
                                <span
                                  className={`text-lg font-black ${
                                    ch.yourRank === 1
                                      ? "text-amber-400"
                                      : ch.yourRank <= 3
                                      ? "text-zinc-300"
                                      : "text-zinc-500"
                                  }`}
                                >
                                  #{ch.yourRank}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string | null;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 p-16 text-center bg-zinc-900/30">
      <div className="text-zinc-600 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-zinc-500 max-w-sm mx-auto mb-6">{description}</p>
      {action && <Button>{action}</Button>}
    </div>
  );
}

function getTimeLeft(endDateStr: string): string {
  const end = new Date(endDateStr).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return "Ending";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}
