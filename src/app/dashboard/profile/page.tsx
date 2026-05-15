"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Settings,
  LogOut,
  Save,
  Loader2,
  Flame,
  Shield,
  Key,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [streakTarget, setStreakTarget] = useState(3);
  const [unitPref, setUnitPref] = useState("kg");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, keyRes] = await Promise.all([
          fetch("/api/settings/profile"),
          fetch("/api/settings/apikey"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setDisplayName(data.displayName ?? "");
          setStreakTarget(data.weeklyStreakTarget ?? 3);
          setUnitPref(data.unitPreference ?? "kg");
          setEmail(data.email ?? "");
        }

        if (keyRes.ok) {
          const data = await keyRes.json();
          setHasApiKey(data.hasApiKey);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await Promise.all([
        fetch("/api/settings/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName, unitPreference: unitPref }),
        }),
        fetch("/api/settings/streak", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weeklyStreakTarget: streakTarget }),
        }),
      ]);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-8 flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-zinc-500 mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile Card */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={email}
              disabled
              className="mt-1.5 text-zinc-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Display Name</label>
            <Input
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Unit Preference</label>
            <div className="flex gap-2 mt-1.5">
              {["kg", "lbs"].map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setUnitPref(unit)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    unitPref === unit
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Settings */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5" />
            Streak Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">
              Weekly Streak Target
            </label>
            <p className="text-xs text-zinc-500 mt-0.5 mb-2">
              Minimum training days per week for your streak to continue.
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStreakTarget(n)}
                  className={`h-10 w-10 rounded-lg border text-sm font-semibold transition-colors ${
                    streakTarget === n
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Connected Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-zinc-400" />
              <div>
                <p className="text-sm font-medium">Hevy API</p>
                <p className="text-xs text-zinc-500">
                  {hasApiKey
                    ? "Connected — workouts sync automatically"
                    : "Not connected"}
                </p>
              </div>
            </div>
            {hasApiKey && (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save + Sign Out */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>

        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full gap-2 text-zinc-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </main>
  );
}
