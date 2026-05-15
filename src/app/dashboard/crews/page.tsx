"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Plus,
  Copy,
  LogIn,
  Shield,
  Globe,
  Lock,
  Crown,
  Swords,
  Flame,
  Calendar,
  Loader2,
} from "lucide-react";

interface Crew {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  privacy: string;
  memberCount: number;
  myRole: string;
  inviteCode: string;
}

export default function CrewsPage() {
  const router = useRouter();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-crews");
  const [inviteCode, setInviteCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createPrivacy, setCreatePrivacy] = useState("INVITE_ONLY");

  // Discover state
  const [discoverCrews, setDiscoverCrews] = useState<Crew[]>([]);
  const [discoverPage, setDiscoverPage] = useState(1);
  const [discoverTotal, setDiscoverTotal] = useState(0);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchCrews = useCallback(async () => {
    try {
      const res = await fetch("/api/crews");
      if (res.ok) {
        const data = await res.json();
        setCrews(data.crews ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch crews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCrews();
  }, [fetchCrews]);

  const fetchDiscover = useCallback(async (page = 1) => {
    setDiscoverLoading(true);
    try {
      const res = await fetch(`/api/crews?discover=true&page=${page}&pageSize=12`);
      if (res.ok) {
        const data = await res.json();
        setDiscoverCrews(data.crews ?? []);
        setDiscoverTotal(data.total ?? 0);
        setDiscoverPage(data.page ?? 1);
      }
    } catch {
      // ignore
    } finally {
      setDiscoverLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "discover") {
      fetchDiscover(1);
    }
  }, [activeTab, fetchDiscover]);

  const handleJoinPublic = async (crewId: string) => {
    setJoiningId(crewId);
    try {
      const res = await fetch("/api/crews/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crewId }),
      });
      if (res.ok) {
        await fetchCrews();
        fetchDiscover(discoverPage);
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreateLoading(true);
    setCreateError("");

    try {
      const res = await fetch("/api/crews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          description: createDesc,
          privacy: createPrivacy,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? "Failed to create crew");
        return;
      }
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
      setCreatePrivacy("INVITE_ONLY");
      await fetchCrews();
      router.refresh();
    } catch (err) {
      setCreateError("Network error");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async () => {
    if (inviteCode.length < 8) return;
    setJoinLoading(true);
    setJoinError("");

    try {
      const res = await fetch("/api/crews/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error ?? "Failed to join crew");
        return;
      }
      setInviteCode("");
      await fetchCrews();
      router.refresh();
    } catch (err) {
      setJoinError("Network error");
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crews</h1>
          <p className="text-zinc-500 mt-1">
            Your gym squads. Compete together, grow together.
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              New Crew
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a Crew</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Crew Name</label>
                <Input
                  placeholder="Iron Brotherhood"
                  className="mt-1.5"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Description <span className="text-zinc-500">(optional)</span>
                </label>
                <Input
                  placeholder="What's your crew about?"
                  className="mt-1.5"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
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
                      onClick={() => setCreatePrivacy(value)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors ${
                        createPrivacy === value
                          ? "border-amber-500 bg-amber-500/10 text-amber-400"
                          : "border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {createError && (
                <p className="text-sm text-red-400">{createError}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={createLoading || !createName.trim()}
              >
                {createLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create Crew
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="my-crews" className="gap-2">
            <Users className="h-4 w-4" />
            My Crews
          </TabsTrigger>
          <TabsTrigger value="join" className="gap-2">
            <LogIn className="h-4 w-4" />
            Join Crew
          </TabsTrigger>
          <TabsTrigger value="discover" className="gap-2">
            <Globe className="h-4 w-4" />
            Discover
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-crews" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
          ) : crews.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 p-16 text-center bg-zinc-900/30">
              <Users className="h-16 w-16 mx-auto text-zinc-700 mb-6" />
              <h3 className="text-xl font-bold mb-2">No crews yet</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-6">
                Create your first crew or join one with an invite code.
              </p>
              <Button onClick={() => setShowCreate(true)}>Create Crew</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {crews.map((crew) => (
                <CrewCard key={crew.id} crew={crew} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="join" className="mt-6">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg">Join with Invite Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter 8-character code"
                  value={inviteCode}
                  onChange={(e) =>
                    setInviteCode(e.target.value.toUpperCase().slice(0, 8))
                  }
                  className="font-mono text-lg tracking-widest uppercase"
                />
                <Button
                  onClick={handleJoin}
                  disabled={inviteCode.length < 8 || joinLoading}
                >
                  {joinLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Join"
                  )}
                </Button>
              </div>
              {joinError && (
                <p className="text-sm text-red-400 mt-3">{joinError}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discover" className="mt-6">
          {discoverLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
          ) : discoverCrews.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 p-12 text-center bg-zinc-900/30">
              <Globe className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No public crews yet</h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                Be the first to create a public crew! Public crews appear here
                for anyone to discover and join.
              </p>
              <Button className="mt-4" onClick={() => setShowCreate(true)}>
                Create a Crew
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {discoverCrews.map((crew) => (
                  <Card key={crew.id} className="border-zinc-800 bg-zinc-900/50">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-2xl font-black text-white shrink-0">
                          {crew.name.charAt(0)}
                        </div>
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-blue-500/10 text-blue-400 border-blue-500/20"
                        >
                          <Globe className="h-3 w-3" />
                          Public
                        </Badge>
                      </div>

                      <h3 className="font-bold text-lg">{crew.name}</h3>
                      <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                        {crew.description ?? "No description"}
                      </p>

                      <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {crew.memberCount} members
                        </span>
                      </div>

                      <Button
                        size="sm"
                        className="w-full mt-4 gap-2"
                        onClick={() => handleJoinPublic(crew.id)}
                        disabled={joiningId === crew.id}
                      >
                        {joiningId === crew.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogIn className="h-4 w-4" />
                        )}
                        Join Crew
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {discoverTotal > 12 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={discoverPage <= 1}
                    onClick={() => fetchDiscover(discoverPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-zinc-500">
                    Page {discoverPage} of{" "}
                    {Math.ceil(discoverTotal / 12)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={discoverPage * 12 >= discoverTotal}
                    onClick={() => fetchDiscover(discoverPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

function CrewCard({ crew }: { crew: Crew }) {
  const privacyIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    PUBLIC: Globe,
    INVITE_ONLY: Lock,
    PRIVATE: Shield,
  };
  const PrivacyIcon = privacyIcons[crew.privacy] ?? Lock;

  return (
    <Link href={`/dashboard/crews/${crew.id}`}>
      <Card className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all group cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl font-black text-white shrink-0">
              {crew.name.charAt(0)}
            </div>
            <div className="flex items-center gap-2">
              <PrivacyIcon className="h-3.5 w-3.5 text-zinc-500" />
              {crew.myRole === "OWNER" && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-amber-500/10 text-amber-400 border-amber-500/20"
                >
                  <Crown className="h-3 w-3" />
                  Owner
                </Badge>
              )}
            </div>
          </div>

          <h3 className="font-bold text-lg group-hover:text-white transition-colors">
            {crew.name}
          </h3>
          <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
            {crew.description ?? "No description"}
          </p>

          <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {crew.memberCount} members
            </span>
          </div>

          {crew.inviteCode && (
            <button
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(crew.inviteCode);
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-800 py-2 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
            >
              <Copy className="h-3 w-3" />
              {crew.inviteCode}
            </button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
