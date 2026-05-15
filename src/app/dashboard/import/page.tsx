"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Key,
  CheckCircle2,
  Zap,
  RefreshCw,
  FileUp,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function ImportPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [csvResult, setCsvResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);
  const [syncResult, setSyncResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);

  // Check if API key already exists
  useEffect(() => {
    const checkKey = async () => {
      try {
        const res = await fetch("/api/settings/apikey");
        if (res.ok) {
          const data = await res.json();
          if (data.hasApiKey) setApiKeySaved(true);
        }
      } catch { /* ignore */ }
    };
    checkKey();
  }, []);

  const handleSaveApiKey = async () => {
    if (apiKey.length < 10) return;
    setSavingKey(true);
    try {
      const res = await fetch("/api/settings/apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      if (res.ok) {
        setApiKeySaved(true);
        setApiKey("");
      }
    } catch (err) {
      console.error("Failed to save API key:", err);
    } finally {
      setSavingKey(false);
    }
  };

  // Auto-trigger initial sync after key is saved
  useEffect(() => {
    if (apiKeySaved && !syncResult) {
      handleSyncNow();
    }
  }, [apiKeySaved]);

  const handleSyncNow = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSyncResult({
          imported: data.imported,
          skipped: data.skipped,
        });
        router.refresh();
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput?.files?.length) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      const res = await fetch("/api/import/csv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setCsvResult(data);
      if (data.imported > 0) {
        router.refresh();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import Workouts</h1>
        <p className="text-zinc-500 mt-1">
          Connect your Hevy data. CSV is free for everyone. API key for automatic sync.
        </p>
      </div>

      <Tabs defaultValue="csv">
        <TabsList className="w-full">
          <TabsTrigger value="csv" className="flex-1 gap-2">
            <FileUp className="h-4 w-4" />
            CSV Upload
            <Badge className="ml-1 bg-emerald-500/20 text-emerald-400 border-0 h-5 px-1.5 text-[10px]">
              Free
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex-1 gap-2">
            <Key className="h-4 w-4" />
            API Key
            <Badge className="ml-1 bg-amber-500/20 text-amber-400 border-0 h-5 px-1.5 text-[10px]">
              Pro
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* CSV Upload Tab */}
        <TabsContent value="csv" className="mt-6 space-y-6">
          <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center bg-zinc-900/30 hover:border-zinc-500 transition-colors">
            <Upload className="h-10 w-10 mx-auto text-zinc-500 mb-4" />
            <p className="text-lg font-medium mb-1">
              Drag & drop your Hevy CSV here
            </p>
            <p className="text-sm text-zinc-500 mb-6">
              Export from Hevy app: Settings → Export Data → Download CSV
            </p>
            <form onSubmit={handleCsvUpload}>
              <input
                type="file"
                name="file"
                accept=".csv"
                className="block mx-auto text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 transition-colors"
              />
              <Button
                type="submit"
                disabled={uploading}
                className="mt-6 px-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  "Upload & Sync"
                )}
              </Button>
            </form>
          </div>

          {csvResult && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-400">
                      Import complete
                    </p>
                    <p className="text-sm text-zinc-400">
                      {csvResult.imported} workouts imported
                      {csvResult.skipped > 0 &&
                        ` · ${csvResult.skipped} duplicates skipped`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* API Key Tab */}
        <TabsContent value="api" className="mt-6 space-y-6">
          {apiKeySaved ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
                <div className="h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  {syncing ? (
                    <Loader2 className="h-7 w-7 text-emerald-400 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-7 w-7 text-emerald-400" />
                  )}
                </div>
                <h3 className="text-lg font-bold mb-1">
                  {syncing ? "Syncing your workouts..." : "API Key Connected"}
                </h3>
                <p className="text-sm text-zinc-400 mb-6 max-w-sm mx-auto">
                  {syncing
                    ? "Fetching your workout history from Hevy. This may take a moment."
                    : syncResult
                      ? `${syncResult.imported + syncResult.skipped} workouts synced. New data appears in challenges automatically.`
                      : "Your workouts will sync automatically every 24 hours. New data appears in challenges automatically."}
                </p>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Badge className="gap-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Data
                  </Badge>
                  <Badge className="gap-1 bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <RefreshCw className="h-3 w-3" />
                    Auto-Sync Active
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSyncNow}
                  disabled={syncing}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync Now"}
                </Button>
              </div>

              {syncResult && (
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-emerald-400">
                          Sync complete
                        </p>
                        <p className="text-sm text-zinc-400">
                          {syncResult.imported} workouts imported
                          {syncResult.skipped > 0 &&
                            ` · ${syncResult.skipped} duplicates skipped`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Key className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Connect with Hevy API</h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        Requires Hevy Pro subscription. Your API key is encrypted
                        at rest and never shared.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Hevy API Key
                      </label>
                      <Input
                        type="password"
                        placeholder="Paste your Hevy API key..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="mt-1.5 font-mono"
                      />
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-4 text-xs text-zinc-500 space-y-2">
                      <p className="font-medium text-zinc-400 mb-2">
                        How to get your API Key:
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5">
                        <li>Go to <a href="https://hevy.com/settings?developer" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">hevy.com/settings?developer</a></li>
                        <li>Click Generate API Key</li>
                        <li>Copy and paste your key here</li>
                      </ol>
                      <p className="pt-2 text-zinc-600">
                        💡 Requires Hevy Pro ($2.99/mo). API keys are only available on the web, not in the mobile app.
                      </p>
                    </div>

                    <Button
                      onClick={handleSaveApiKey}
                      disabled={apiKey.length < 10 || savingKey}
                      className="w-full gap-2"
                    >
                      {savingKey ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Connect API Key
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: <RefreshCw className="h-4 w-4" />,
                    title: "Auto-Sync",
                    desc: "Daily automatic workout sync",
                  },
                  {
                    icon: <ShieldCheck className="h-4 w-4" />,
                    title: "Verified Badge",
                    desc: "Trusted data in leaderboards",
                  },
                  {
                    icon: <Zap className="h-4 w-4" />,
                    title: "Real-Time",
                    desc: "Challenges update instantly",
                  },
                  {
                    icon: <ArrowRight className="h-4 w-4" />,
                    title: "No Uploads",
                    desc: "Never drag & drop again",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
                  >
                    <div className="text-amber-400 mb-2">{item.icon}</div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
