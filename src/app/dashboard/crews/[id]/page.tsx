"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  Calendar,
  Crown,
  Loader2,
  Globe,
  Lock,
  Shield,
  Check,
  Copy,
  Trash2,
  Pencil,
  LogOut,
} from "lucide-react";

// ── Types ──

interface FeedItem {
  id: string;
  type: "workout" | "pr" | "challenge_join" | "badge";
  user: { name: string; avatar: string | null; initials: string };
  workout?: string;
  volume?: number;
  prs?: number;
  exercise?: string;
  old?: string;
  new?: string;
  badge?: string;
  badgeIcon?: string;
  challenge?: string;
  time: string;
}

interface Member {
  name: string;
  initials: string;
  role: string;
  streak: number;
  volume: number;
  workouts: number;
  avatar: string | null;
}

interface LeaderboardEntry {
  rank: number | null;
  name: string;
  initials: string;
  score: number;
}

interface ActiveChallenge {
  id: string;
  type: string;
  title: string;
  startDate: string;
  endDate: string;
  leaderboard: LeaderboardEntry[];
}

interface PastChallenge {
  id: string;
  title: string;
  type: string;
  winner: { name: string; initials: string } | null;
  participants: number;
  endedAt: string;
}

interface CrewDetail {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  privacy: string;
  inviteCode: string;
  memberCount: number;
  myRole: string;
  createdAt: string;
  members: Member[];
  activeChallenge: ActiveChallenge | null;
  pastChallenges: PastChallenge[];
  feed: FeedItem[];
}

// ── Challenge type metadata ──

const challengeTypeMeta: Record<string, { bg: string; color: string }> = {
  IRON_KING: { bg: "bg-amber-500/10", color: "text-amber-400" },
  CONSISTENCY: { bg: "bg-emerald-500/10", color: "text-emerald-400" },
  PR_BREAKER: { bg: "bg-violet-500/10", color: "text-violet-400" },
  GRINDER: { bg: "bg-red-500/10", color: "text-red-400" },
  CUSTOM: { bg: "bg-sky-500/10", color: "text-sky-400" },
};

const privacyIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  PUBLIC: Globe,
  INVITE_ONLY: Lock,
  PRIVATE: Shield,
};

// ── Page ──

export default function CrewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [crew, setCrew] = useState<CrewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("feed");

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrivacy, setEditPrivacy] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const res = await fetch(`/api/crews/${id}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Failed to load crew");
          return;
        }
        const data = await res.json();
        setCrew(data);
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchCrew();
  }, [id]);

  const handleCopyInvite = () => {
    if (!crew) return;
    navigator.clipboard.writeText(crew.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEdit = () => {
    if (!crew) return;
    setEditName(crew.name);
    setEditDesc(crew.description ?? "");
    setEditPrivacy(crew.privacy);
    setEditError("");
    setShowSettings(false);
    setShowEdit(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setEditLoading(true);
    setEditError("");

    try {
      const res = await fetch(`/api/crews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDesc.trim() || "",
          privacy: editPrivacy,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setEditError(data.error ?? "Failed to update");
        return;
      }

      setShowEdit(false);
      // Refetch crew data
      const refetch = await fetch(`/api/crews/${id}`);
      if (refetch.ok) setCrew(await refetch.json());
    } catch {
      setEditError("Network error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/crews/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/crews");
      }
    } catch {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-8 flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </main>
    );
  }

  if (error || !crew) {
    return (
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        <Link
          href="/dashboard/crews"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Crews
        </Link>
        <div className="rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-500 text-lg">{error || "Crew not found"}</p>
        </div>
      </main>
    );
  }

  const maxVolume = crew.members.length
    ? Math.max(...crew.members.map((m) => m.volume), 1)
    : 1;

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
                <h1 className="text-3xl font-bold tracking-tight">
                  {crew.name}
                </h1>
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
              <p className="text-zinc-500 mt-1.5">
                {crew.description ?? "No description"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Invite */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleCopyInvite}
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Invite"}
            </Button>

            {/* Settings */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>

              {showSettings && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSettings(false)}
                  />
                  <div className="absolute right-0 top-10 w-48 rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl z-20 py-1">
                    <button
                      onClick={openEdit}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Crew
                    </button>
                    {crew.myRole === "OWNER" && (
                      <>
                        <div className="h-px bg-zinc-800 mx-2 my-1" />
                        <button
                          onClick={() => {
                            setShowSettings(false);
                            setShowDelete(true);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Crew
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Challenge Banner */}
      {crew.activeChallenge && (
        <Link href={`/dashboard/challenges/${crew.activeChallenge.id}`}>
          <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5 hover:border-amber-500/50 transition-all cursor-pointer overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Badge className="gap-1 bg-amber-500/20 text-amber-400 border-0">
                    <Swords className="h-3 w-3" />
                    Live Challenge
                  </Badge>
                  <h2 className="text-xl font-bold mt-2">
                    {crew.activeChallenge.title}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" />
                    Ends{" "}
                    {new Date(crew.activeChallenge.endDate).toLocaleDateString(
                      "en-US",
                      { weekday: "short", month: "short", day: "numeric" }
                    )}
                    {crew.activeChallenge.leaderboard[0] && (
                      <>
                        {" · "}
                        <Trophy className="h-3.5 w-3.5 inline mr-1" />
                        {crew.activeChallenge.leaderboard[0].name} leads with{" "}
                        {crew.activeChallenge.leaderboard[0].score.toLocaleString()}{" "}
                        kg
                      </>
                    )}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  {crew.activeChallenge.leaderboard.slice(0, 3).map((p, i) => (
                    <div
                      key={p.name}
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
          {crew.feed.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 p-12 text-center">
              <Flame className="h-8 w-8 mx-auto text-zinc-600 mb-3" />
              <p className="text-sm text-zinc-500">
                No activity yet. Start working out!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {crew.feed.map((item) => (
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
                      <span className="font-semibold text-sm">
                        {item.user.name}
                      </span>
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
                        <span className="text-zinc-400 line-through">
                          {item.old}
                        </span>{" "}
                        →{" "}
                        <span className="text-white font-semibold">
                          {item.new}
                        </span>
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
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-6">
          <div className="space-y-2">
            {crew.members.map((member, i) => (
              <div
                key={member.name}
                className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all"
              >
                <span className="text-sm font-mono text-zinc-600 w-6 text-right">
                  {i + 1}
                </span>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar ?? undefined} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs font-semibold">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {member.name}
                    </span>
                    {member.role === "OWNER" && (
                      <Crown className="h-3 w-3 text-amber-400" />
                    )}
                    {member.role === "ADMIN" && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 px-1"
                      >
                        ADMIN
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-400" />
                      {member.streak} week streak
                    </span>
                    <span>
                      {member.volume.toLocaleString()} kg lifetime
                    </span>
                    <span>{member.workouts} workouts</span>
                  </div>
                </div>
                <div className="hidden sm:block w-24">
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{
                        width: `${(member.volume / maxVolume) * 100}%`,
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
            {crew.activeChallenge ? (
              <Link
                href={`/dashboard/challenges/${crew.activeChallenge.id}`}
              >
                <Card className="border-amber-500/30 bg-zinc-900/50 hover:border-amber-500/50 transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <Swords className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-bold">
                            {crew.activeChallenge.title}
                          </h3>
                          <p className="text-xs text-zinc-500">
                            {crew.activeChallenge.leaderboard.length}{" "}
                            participants · Ends{" "}
                            {new Date(
                              crew.activeChallenge.endDate
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
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
                <Link
                  href="/dashboard/challenges"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors"
                >
                  New Challenge
                </Link>
              </div>
            )}
          </div>

          <Separator className="bg-zinc-800" />

          {/* Past */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Past Challenges
            </h3>
            {crew.pastChallenges.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">
                No completed challenges yet
              </p>
            ) : (
              <div className="space-y-2">
                {crew.pastChallenges.map((ch) => (
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
                                {ch.participants} participants · Ended{" "}
                                {new Date(ch.endedAt).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" }
                                )}
                              </p>
                            </div>
                          </div>
                          {ch.winner && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-500">
                                Winner:
                              </span>
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
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Crew Dialog */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-4">Edit Crew</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Description <span className="text-zinc-500">(optional)</span>
                </label>
                <Input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Privacy</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {[
                    { value: "PUBLIC", icon: Globe, label: "Public" },
                    { value: "INVITE_ONLY", icon: Lock, label: "Invite Only" },
                    { value: "PRIVATE", icon: Shield, label: "Private" },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEditPrivacy(value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors ${
                        editPrivacy === value
                          ? "border-amber-500 bg-amber-500/10 text-amber-400"
                          : "border-zinc-800 hover:border-zinc-600 text-zinc-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {editError && (
                <p className="text-sm text-red-400">{editError}</p>
              )}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={editLoading || !editName.trim()}
                >
                  {editLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDelete(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-red-500/20 bg-zinc-950 p-6 shadow-2xl text-center">
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="text-lg font-bold mb-2">Delete Crew?</h2>
            <p className="text-sm text-zinc-400 mb-6">
              This will permanently delete <strong className="text-white">{crew.name}</strong> and all its challenges and data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {deleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete Forever"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
