"use client";

import { useState } from "react";
import { Flame, Info, ChevronDown } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  workoutsThisWeek: number;
  targetDays: number;
  onTargetChange?: (target: number) => void;
}

export function StreakCard({
  currentStreak,
  longestStreak,
  workoutsThisWeek,
  targetDays,
  onTargetChange,
}: StreakCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [changingTarget, setChangingTarget] = useState(false);

  const progress = Math.min((workoutsThisWeek / targetDays) * 100, 100);
  const flameSize =
    currentStreak >= 52
      ? "h-8 w-8"
      : currentStreak >= 12
        ? "h-7 w-7"
        : currentStreak >= 4
          ? "h-6 w-6"
          : "h-5 w-5";
  const glowColor =
    currentStreak >= 52
      ? "from-purple-500 to-pink-500"
      : currentStreak >= 12
        ? "from-amber-500 to-orange-500"
        : currentStreak >= 4
          ? "from-amber-400 to-amber-500"
          : "from-zinc-500 to-zinc-600";

  async function handleTargetChange(newTarget: number) {
    setChangingTarget(true);
    try {
      await fetch("/api/settings/streak", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyStreakTarget: newTarget }),
      });
      onTargetChange?.(newTarget);
    } catch {
      // ignore
    } finally {
      setChangingTarget(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 relative">
      {/* Tooltip trigger area */}
      <div className="absolute top-4 right-4 z-10">
        <div className="relative">
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-zinc-600 hover:text-zinc-400 transition-colors"
            aria-label="How is streak calculated?"
          >
            <Info className="h-4 w-4" />
          </button>

          {/* Tooltip popover */}
          {showTooltip && (
            <div className="absolute right-0 top-6 w-64 rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl p-3 text-left z-20">
              <p className="text-xs font-semibold text-white mb-2">
                How is the weekly streak calculated?
              </p>
              <ul className="text-[11px] text-zinc-400 space-y-1.5 list-disc list-inside">
                <li>
                  A week counts if you train <strong className="text-amber-400">{targetDays} or more days</strong>{" "}
                  (Mon–Sun).
                </li>
                <li>
                  Rest days are expected — they don&apos;t break your streak.
                </li>
                <li>
                  If you&apos;re mid-week and haven&apos;t hit {targetDays} yet, the
                  current week is still in progress.
                </li>
                <li>
                  The streak only resets if you complete a week with fewer
                  than {targetDays} training days.
                </li>
                <li>
                  Missing a full week resets the streak to zero.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-12 w-12 rounded-xl bg-gradient-to-br ${glowColor} flex items-center justify-center`}
          >
            <Flame className={`${flameSize} text-white`} />
          </div>
          <div>
            <p className="text-3xl font-black text-white tabular-nums">
              {currentStreak}
              <span className="text-lg font-normal text-zinc-500 ml-1">
                weeks
              </span>
            </p>
            <p className="text-xs text-zinc-500">Weekly streak</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-400">
            Record:{" "}
            <span className="font-bold text-white tabular-nums">
              {longestStreak}
            </span>
            w
          </p>
        </div>
      </div>

      {/* Weekly progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">This week</span>
            {/* Target selector */}
            {onTargetChange && (
              <div className="relative">
                <button
                  onClick={() => {
                    const next =
                      targetDays >= 7 ? 1 : targetDays + 1;
                    handleTargetChange(next);
                  }}
                  disabled={changingTarget}
                  className="flex items-center gap-0.5 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors bg-zinc-800/50 rounded px-1.5 py-0.5"
                >
                  target: {targetDays}/wk
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          <span className="text-xs text-zinc-400 tabular-nums">
            {workoutsThisWeek}/{targetDays} days
          </span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${glowColor} transition-all duration-700 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
