"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Users,
  Settings,
  Share2,
  Swords,
  Trophy,
  Clock,
  Dumbbell,
  Flame,
  Medal,
  TrendingUp,
  Calendar,
  Crown,
} from "lucide-react";

// Mock crew data
const crew = {
  id: "1",
  name: "Iron Brotherhood",
  description: "Push, pull, legs. Every day. No excuses.",
  privacy: "invite_only",
  memberCount: 12,
  inviteCode: "XK9M2P",
  myRole: "OWNER",
  createdAt: "2025-11-15",
};

const mockFeed = [
  {
    id: "1",
    type: "workout",
    user: { name: "Andress", avatar: null, initials: "AN" },
    workout: "Pecho, Hombro, Triceps",
    volume: 12450,
    prs: 2,
    time: "2h ago",
  },
  {
    id: "2",
    type: "pr",
    user: { name: "Carlos", avatar: null, initials: "CR" },
    exercise: "Bench Press",
    old: "90kg x 5",
    new: "92.5kg x 5",
    time: "5h ago",
  },
  {
    id: "3",
    type: "challenge_join",
    user: { name: "María", avatar: null, initials: "MA" },
    challenge: "Iron King — Week 20",
    time: "8h ago",
  },
  {
    id: "4",
    type: "workout",
    user: { name: "Diego", avatar: null, initials: "DG" },
    workout: "Biceps/Espalda",
    volume: 9800,
    prs: 1,
    time: "12h ago",
  },
  {
    id: "5",
    type: "badge",
    user: { name: "Andress", avatar: null, initials: "AN" },
    badge: "Monthly Grinder",
    badgeIcon: "🔥🔥",
    time: "1d ago",
  },
];

const mockMembers = [
  { name: "Andress", initials: "AN", role: "OWNER", streak: 14, volume: 284000, workouts: 87 },
  { name: "Carlos", initials: "CR", role: "ADMIN", streak: 8, volume: 156000, workouts: 52 },
  { name: "María", initials: "MA", role: "MEMBER", streak: 21, volume: 192000, workouts: 64 },
  { name: "Diego", initials: "DG", role: "MEMBER", streak: 5, volume: 89000, workouts: 31 },
  { name: "Laura", initials: "LA", role: "MEMBER", streak: 3, volume: 45000, workouts: 18 },
  { name: "Pablo", initials: "PB", role: "MEMBER", streak: 12, volume: 210000, workouts: 71 },
];

const activeChallenge = {
  id: "c1",
  type: "IRON_KING",
  title: "Iron King — Week 20",
  startDate: "2026-05-11",
  endDate: "2026-05-17",
  leaderboard: [
    { rank: 1, name: "Andress", initials: "AN", score: 84200 },
    { rank: 2, name: "María", initials: "MA", score: 76100 },
    { rank: 3, name: "Carlos", initials: "CR", score: 58900 },
    { rank: 4, name: "Pablo", initials: "PB", score: 45200 },
    { rank: 5, name: "Diego", initials: "DG", score: 31200 },
    { rank: 6, name: "Laura", initials: "LA", score: 18700 },
  ],
};

const pastChallenges = [
  {
    id: "c0",
    title: "PR Breaker — Week 19",
    type: "PR_BREAKER",
    winner: { name: "María", initials: "MA" },
    endedAt: "2026-05-10",
    participants: 10,
  },
];

export default function CrewPage() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Back + Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard/crews"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Crews
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl font-black text-white shrink-0">
              {crew.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight">{crew.name}</h1>
                <Badge variant="secondary" className="gap-1.5">
                  <Users className="h-3 w-3" />
                  {crew.memberCount}
                </Badge>
                {crew.myRole === "OWNER" && (
                  <Badge className="gap-1 bg-amber-500/10 text-amber-400 border-amber-500/20">
                    <Crown className="h-3 w-3" />
                    Owner
                  </Badge>
                )}
              </div>
              <p className="text-zinc-500 mt-1.5">{crew.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Invite
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Challenge Banner */}
      {activeChallenge && (
        <Link href={`/dashboard/challenges/${activeChallenge.id}`}>
          <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5 hover:border-amber-500/50 transition-all cursor-pointer overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Badge className="gap-1 bg-amber-500/20 text-amber-400 border-0">
                    <Swords className="h-3 w-3" />
                    Live Challenge
                  </Badge>
                  <h2 className="text-xl font-bold mt-2">{activeChallenge.title}</h2>
                  <p className="text-sm text-zinc-500">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" />
                    Ends Sunday, May 17
                    {" · "}
                    <Trophy className="h-3.5 w-3.5 inline mr-1" />
                    {activeChallenge.leaderboard[0]?.name} leads with{" "}
                    {activeChallenge.leaderboard[0]?.score.toLocaleString()} kg
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  {activeChallenge.leaderboard.slice(0, 3).map((p, i) => (
                    <div
                      key={p.rank}
                      className="flex flex-col items-center gap-1 w-20"
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          i === 0
                            ? "bg-amber-500 text-black"
                            : i === 1
                            ? "bg-zinc-400 text-black"
                            : "bg-amber-800 text-amber-200"
                        }`}
                      >
                        {p.initials}
                      </div>
                      <span className="text-[10px] text-zinc-500 text-center leading-tight">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="feed" className="gap-2">
            <Flame className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Swords className="h-4 w-4" />
            Challenges
          </TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="mt-6">
          <div className="space-y-3">
            {mockFeed.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={item.user.avatar ?? undefined} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                    {item.user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{item.user.name}</span>
                    <span className="text-xs text-zinc-500">{item.time}</span>
                  </div>
                  {item.type === "workout" && (
                    <div className="mt-1 space-y-1">
                      <p className="text-sm">
                        Logged{" "}
                        <span className="font-medium text-white">
                          {item.workout}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" />
                          {(item.volume ?? 0).toLocaleString()} kg
                        </span>
                        {(item.prs ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <Trophy className="h-3 w-3" />
                            {item.prs} PR{(item.prs ?? 0) > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {item.type === "pr" && (
                    <p className="text-sm mt-1">
                      Broke PR on{" "}
                      <span className="font-medium text-amber-400">
                        {item.exercise}
                      </span>
                      :{" "}
                      <span className="text-zinc-400 line-through">{item.old}</span>{" "}
                      → <span className="text-white font-semibold">{item.new}</span>
                    </p>
                  )}
                  {item.type === "challenge_join" && (
                    <p className="text-sm mt-1">
                      Joined{" "}
                      <span className="font-medium text-amber-400">
                        {item.challenge}
                      </span>
                    </p>
                  )}
                  {item.type === "badge" && (
                    <p className="text-sm mt-1">
                      Earned{" "}
                      <span className="font-medium text-white">
                        {item.badgeIcon} {item.badge}
                      </span>{" "}
                      badge
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-6">
          <div className="space-y-2">
            {mockMembers.map((member, i) => (
              <div
                key={member.name}
                className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all"
              >
                <span className="text-sm font-mono text-zinc-600 w-6 text-right">
                  {i + 1}
                </span>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs font-semibold">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{member.name}</span>
                    {member.role === "OWNER" && (
                      <Crown className="h-3 w-3 text-amber-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-400" />
                      {member.streak} day streak
                    </span>
                    <span>{member.volume.toLocaleString()} kg lifetime</span>
                    <span>{member.workouts} workouts</span>
                  </div>
                </div>
                <div className="hidden sm:block w-24">
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{
                        width: `${(member.volume / 284000) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="mt-6 space-y-6">
          {/* Active */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Active
            </h3>
            {activeChallenge ? (
              <Link href={`/dashboard/challenges/${activeChallenge.id}`}>
                <Card className="border-amber-500/30 bg-zinc-900/50 hover:border-amber-500/50 transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <Swords className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-bold">{activeChallenge.title}</h3>
                          <p className="text-xs text-zinc-500">
                            {activeChallenge.leaderboard.length} participants · Ends May 17
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-400 border-0">
                        Live
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
                <Swords className="h-8 w-8 mx-auto text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-500 mb-4">
                  No active challenges. Start one!
                </p>
                <Button size="sm">New Challenge</Button>
              </div>
            )}
          </div>

          <Separator className="bg-zinc-800" />

          {/* Past */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Past Challenges
            </h3>
            <div className="space-y-2">
              {pastChallenges.map((ch) => (
                <Link key={ch.id} href={`/dashboard/challenges/${ch.id}`}>
                  <Card className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div>
                            <h3 className="font-bold">{ch.title}</h3>
                            <p className="text-xs text-zinc-500">
                              {ch.participants} participants · Ended {ch.endedAt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">Winner:</span>
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-amber-500/20 text-amber-400 text-[10px]">
                                {ch.winner.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-amber-400">
                              {ch.winner.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
