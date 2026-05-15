"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned: boolean;
  earnedAt: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  STREAK: "Streak",
  VOLUME: "Volume",
  PR: "Personal Records",
  CHALLENGE: "Challenges",
  RARITY: "Rarity",
  COMMUNITY: "Community",
};

export default function BadgesPage() {
  const [earned, setEarned] = useState<BadgeItem[]>([]);
  const [locked, setLocked] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch("/api/badges");
        if (res.ok) {
          const data = await res.json();
          setEarned(data.earned ?? []);
          setLocked(data.locked ?? []);
        }
      } catch { /* ignore */ }
      finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const categories = [...new Set([...earned, ...locked].map((b) => b.category))];

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-8 flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Badges</h1>
        <p className="text-zinc-500 mt-1">
          {earned.length} earned · {locked.length} locked
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            !filter
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === cat
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Earned section */}
      {earned.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Earned
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {earned
              .filter((b) => !filter || b.category === filter)
              .map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{badge.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {badge.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                        {badge.description}
                      </p>
                      {badge.earnedAt && (
                        <p className="text-[10px] text-emerald-500/70 mt-1.5">
                          {new Date(badge.earnedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Locked section */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Locked
        </h2>
        {locked.filter((b) => !filter || b.category === filter).length === 0 ? (
          <p className="text-sm text-zinc-600 py-8 text-center">
            You&apos;ve unlocked every badge in this category!
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {locked
              .filter((b) => !filter || b.category === filter)
              .map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 opacity-50 hover:opacity-70 transition-opacity"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0 grayscale">{badge.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-500">
                        {badge.name}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
