"use client";

import { useState } from "react";
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
} from "lucide-react";

// Mock data — replace with API calls
const mockCrews = [
  {
    id: "1",
    name: "Iron Brotherhood",
    description: "Push, pull, legs. Every day.",
    avatar: null,
    privacy: "public",
    memberCount: 12,
    activeChallenge: "Iron King — Week 20",
    myRole: "MEMBER",
    inviteCode: "XK9M2P",
  },
  {
    id: "2",
    name: "Gym Ratz",
    description: "Casual lifters, serious gains.",
    avatar: null,
    privacy: "invite_only",
    memberCount: 8,
    activeChallenge: null,
    myRole: "OWNER",
    inviteCode: "RT7Q4N",
  },
  {
    id: "3",
    name: "Callejeros Fit",
    description: "Entrenando juntos aunque estemos lejos.",
    avatar: null,
    privacy: "private",
    memberCount: 5,
    activeChallenge: null,
    myRole: "MEMBER",
    inviteCode: "LP3W8V",
  },
];

export default function CrewsPage() {
  const [activeTab, setActiveTab] = useState("my-crews");
  const [inviteCode, setInviteCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);

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
            <form className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Crew Name</label>
                <Input placeholder="Iron Brotherhood" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Description <span className="text-zinc-500">(optional)</span>
                </label>
                <Input placeholder="What's your crew about?" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium">Privacy</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {[
                    { value: "public", icon: Globe, label: "Public" },
                    { value: "invite_only", icon: Lock, label: "Invite Only" },
                    { value: "private", icon: Shield, label: "Private" },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      className="flex flex-col items-center gap-1.5 rounded-lg border border-zinc-800 p-3 text-xs hover:border-zinc-600 transition-colors"
                    >
                      <Icon className="h-4 w-4 text-zinc-400" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
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
          {mockCrews.length === 0 ? (
            <EmptyState
              title="No crews yet"
              description="Create your first crew or join one with an invite code."
              action="Create Crew"
              onAction={() => setShowCreate(true)}
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {mockCrews.map((crew) => (
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
                <Button disabled={inviteCode.length < 8}>Join</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discover" className="mt-6">
          <div className="rounded-xl border border-zinc-800 p-12 text-center bg-zinc-900/30">
            <Globe className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              Discover public crews from around the world. For now, join crews
              via invite codes from your friends.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}

function CrewCard({
  crew,
}: {
  crew: (typeof mockCrews)[number];
}) {
  const privacyIcons = {
    public: Globe,
    invite_only: Lock,
    private: Shield,
  };
  const PrivacyIcon = privacyIcons[crew.privacy as keyof typeof privacyIcons];

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
            {crew.description}
          </p>

          <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {crew.memberCount} members
            </span>
            {crew.activeChallenge && (
              <span className="flex items-center gap-1 text-amber-400">
                <Swords className="h-3.5 w-3.5" />
                Active challenge
              </span>
            )}
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

function EmptyState({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 p-16 text-center bg-zinc-900/30">
      <Users className="h-16 w-16 mx-auto text-zinc-700 mb-6" />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-zinc-500 max-w-sm mx-auto mb-6">{description}</p>
      <Button onClick={onAction}>{action}</Button>
    </div>
  );
}
