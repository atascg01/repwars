import { Flame } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  workoutsThisWeek: number;
  targetDays: number;
}

export function StreakCard({
  currentStreak,
  longestStreak,
  workoutsThisWeek,
  targetDays,
}: StreakCardProps) {
  const progress = Math.min((workoutsThisWeek / targetDays) * 100, 100);
  const flameSize = currentStreak >= 90 ? "h-8 w-8" : currentStreak >= 30 ? "h-7 w-7" : currentStreak >= 7 ? "h-6 w-6" : "h-5 w-5";
  const glowColor = currentStreak >= 90
    ? "from-purple-500 to-pink-500"
    : currentStreak >= 30
      ? "from-amber-500 to-orange-500"
      : currentStreak >= 7
        ? "from-amber-400 to-amber-500"
        : "from-zinc-500 to-zinc-600";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${glowColor} flex items-center justify-center`}>
            <Flame className={`${flameSize} text-white`} />
          </div>
          <div>
            <p className="text-3xl font-black text-white tabular-nums">
              {currentStreak}
              <span className="text-lg font-normal text-zinc-500 ml-1">days</span>
            </p>
            <p className="text-xs text-zinc-500">Current streak</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-400">
            Record: <span className="font-bold text-white tabular-nums">{longestStreak}</span>d
          </p>
        </div>
      </div>

      {/* Weekly progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">This week</span>
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
