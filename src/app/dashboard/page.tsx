import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Dumbbell,
  Weight,
  BarChart3,
  Trophy,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";
import { WeeklyVolumeChart } from "@/components/charts/weekly-volume-chart";
import { MuscleGroupDonut } from "@/components/charts/muscle-group-donut";
import { VolumeTrendChart } from "@/components/charts/volume-trend-chart";
import { WorkoutHeatmap } from "@/components/charts/workout-heatmap";
import { StreakCard } from "@/components/dashboard/streak-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { WeekNavInline } from "@/components/charts/week-nav-inline";
import { guessMuscleGroup, MUSCLE_COLORS, MUSCLE_LABELS } from "@/lib/muscle-groups";
import { calcWeeklyStreak, calcLongestWeeklyStreak, calcWeeklyWorkouts } from "@/lib/streaks";

// ── Helpers ───────────────────────────────────────────────

function getMonday(d: Date = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

// ── Page ──────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const { week: weekParam } = await searchParams;

  // Parse selected week (YYYY-MM-DD = any day in the target week, defaults to today)
  const selectedWeekStart = weekParam
    ? getMonday(new Date(weekParam + "T12:00:00"))
    : getMonday();
  const selectedWeekEnd = new Date(selectedWeekStart);
  selectedWeekEnd.setDate(selectedWeekEnd.getDate() + 7);

  // For prev/next navigation
  const prevWeek = new Date(selectedWeekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(selectedWeekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const isCurrentWeek =
    getDateStr(selectedWeekStart) === getDateStr(getMonday());

  // Week label (e.g. "May 11 – 17, 2026")
  const weekEndLabel = new Date(selectedWeekEnd);
  weekEndLabel.setDate(weekEndLabel.getDate() - 1);
  const weekLabel = `${selectedWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEndLabel.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      displayName: true,
      name: true,
      currentStreak: true,
      longestStreak: true,
      totalVolumeLifted: true,
      lastWorkoutDate: true,
      unitPreference: true,
      weeklyStreakTarget: true,
      createdAt: true,
    },
  });

  const streakTarget = user?.weeklyStreakTarget ?? 3;

  const displayName =
    user?.displayName ?? user?.name ?? session.user?.name ?? "Athlete";

  // Date ranges based on selected week
  const weekStart = selectedWeekStart;
  const fourWeeksAgo = new Date(weekStart);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 21); // 3 weeks back from start
  const heatmapStart = new Date(weekStart);
  heatmapStart.setDate(heatmapStart.getDate() - 11 * 7); // 11 weeks back

  // Trend: 4 weeks ending with the selected week
  const trendStart = new Date(weekStart);
  trendStart.setDate(trendStart.getDate() - 21);

  // ── This week's workouts (selected week) ──
  const weekWorkouts = await prisma.workout.findMany({
    where: { userId, startTime: { gte: weekStart, lt: selectedWeekEnd } },
    include: { exercises: { include: { sets: true } } },
    orderBy: { startTime: "desc" },
  });

  // ── 4 weeks (selected + 3 prior) for trend ──
  const monthWorkouts = await prisma.workout.findMany({
    where: { userId, startTime: { gte: trendStart, lt: selectedWeekEnd } },
    include: { exercises: { include: { sets: true } } },
  });

  // ── 12 weeks for heatmap (selected + 11 prior) ──
  const heatmapWorkouts = await prisma.workout.findMany({
    where: { userId, startTime: { gte: heatmapStart, lt: selectedWeekEnd } },
    include: { exercises: { include: { sets: true } } },
  });

  // ── Recent workouts ──
  const recentWorkouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { startTime: "desc" },
    take: 5,
    include: { exercises: { include: { sets: true } } },
  });

  // ── Challenge wins ──
  const challengeWins = await prisma.challengeParticipant.count({
    where: { userId, rank: 1 },
  });

  // ── Streak calculation ─────────────────────────────────
  const allWorkoutDates = await prisma.workout.findMany({
    where: { userId },
    select: { startTime: true },
    orderBy: { startTime: "desc" },
  });

  const trainingDays = new Set(
    allWorkoutDates.map((w) => w.startTime.toISOString().slice(0, 10)),
  );

  const weeklyStreak = calcWeeklyStreak(trainingDays, streakTarget);
  const longestStreak = Math.max(
    calcLongestWeeklyStreak(trainingDays, streakTarget),
    user?.longestStreak ?? 0,
  );

  // ── Compute weekly volume per day ──────────────────────
  const dailyVolume: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    dailyVolume[getDateStr(d)] = 0;
  }

  for (const w of weekWorkouts) {
    const key = w.startTime.toISOString().slice(0, 10);
    if (dailyVolume[key] !== undefined) {
      let vol = 0;
      for (const e of w.exercises) {
        for (const s of e.sets) {
          if (s.weightKg && s.reps) vol += s.weightKg * s.reps;
        }
      }
      dailyVolume[key] = (dailyVolume[key] ?? 0) + vol;
    }
  }

  const weeklyBarData = Object.entries(dailyVolume).map(([dateStr, vol]) => {
    const d = new Date(dateStr + "T12:00:00");
    const dayIdx = d.getDay();
    return {
      day: DAY_NAMES[dayIdx],
      label: DAY_LABELS[dayIdx],
      volume: Math.round(vol),
    };
  });

  const totalWeeklyVolume = Object.values(dailyVolume).reduce((s, v) => s + v, 0);
  const totalWeeklyWorkouts = weekWorkouts.length;

  // ── Compute muscle group distribution ──────────────────
  const muscleVolumes: Record<string, number> = {};
  for (const w of weekWorkouts) {
    for (const e of w.exercises) {
      const group = guessMuscleGroup(e.title);
      if (!group) continue;

      let vol = 0;
      for (const s of e.sets) {
        if (s.weightKg && s.reps) vol += s.weightKg * s.reps;
      }
      if (vol > 0) {
        muscleVolumes[group] = (muscleVolumes[group] ?? 0) + vol;
      }
    }
  }

  const donutData = Object.entries(muscleVolumes)
    .sort(([, a], [, b]) => b - a)
    .map(([group, vol]) => ({
      name: MUSCLE_LABELS[group] ?? group,
      volume: Math.round(vol),
      color: MUSCLE_COLORS[group] ?? "#71717a",
    }));

  // ── Compute 4-week trend ───────────────────────────────
  const weeklyTotals: { week: string; volume: number }[] = [];
  for (let w = 3; w >= 0; w--) {
    const start = new Date(weekStart);
    start.setDate(start.getDate() - w * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    let vol = 0;
    for (const workout of monthWorkouts) {
      const t = new Date(workout.startTime).getTime();
      if (t >= start.getTime() && t < end.getTime()) {
        for (const e of workout.exercises) {
          for (const s of e.sets) {
            if (s.weightKg && s.reps) vol += s.weightKg * s.reps;
          }
        }
      }
    }

    const endLabel = new Date(end);
    endLabel.setDate(endLabel.getDate() - 1);
    weeklyTotals.push({
      week: `${start.getDate()}/${start.getMonth() + 1}`,
      volume: Math.round(vol),
    });
  }

  // ── Compute heatmap data ───────────────────────────────
  const heatmapDays: { date: string; volume: number }[] = [];
  const heatmapMap: Record<string, number> = {};
  for (const w of heatmapWorkouts) {
    const key = w.startTime.toISOString().slice(0, 10);
    let vol = 0;
    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (s.weightKg && s.reps) vol += s.weightKg * s.reps;
      }
    }
    heatmapMap[key] = (heatmapMap[key] ?? 0) + vol;
  }
  for (const [date, vol] of Object.entries(heatmapMap)) {
    heatmapDays.push({ date, volume: Math.round(vol) });
  }

  // ── Weekly time ────────────────────────────────────────
  let weeklyTimeMin = 0;
  for (const w of weekWorkouts) {
    const duration =
      (new Date(w.endTime).getTime() - new Date(w.startTime).getTime()) / 60000;
    if (duration > 0 && duration < 300) weeklyTimeMin += duration;
  }
  const timeStr =
    weeklyTimeMin >= 60
      ? `${Math.floor(weeklyTimeMin / 60)}h ${Math.round(weeklyTimeMin % 60)}m`
      : `${Math.round(weeklyTimeMin)}m`;

  // ── Top exercises ──────────────────────────────────────
  const exerciseVolumes: { title: string; volume: number }[] = [];
  for (const w of weekWorkouts) {
    for (const e of w.exercises) {
      let vol = 0;
      for (const s of e.sets) {
        if (s.weightKg && s.reps) vol += s.weightKg * s.reps;
      }
      if (vol > 0) {
        const existing = exerciseVolumes.find((x) => x.title === e.title);
        if (existing) existing.volume += vol;
        else exerciseVolumes.push({ title: e.title, volume: vol });
      }
    }
  }
  const topExercises = exerciseVolumes
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 3);

  // ── Member since ───────────────────────────────────────
  const daysSinceJoin = user?.createdAt
    ? Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) / 86400000,
      )
    : null;

  return (
    <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            👋 Hey, {displayName}!
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Your command center</p>
        </div>
        <div className="flex items-center gap-2">
          {daysSinceJoin !== null && (
            <span className="text-xs text-zinc-600 hidden sm:block">
              Member for {daysSinceJoin} days
            </span>
          )}
        </div>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between gap-3">
        <a
          href={`/dashboard?week=${prevWeek.toISOString().slice(0, 10)}`}
          className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800/50"
        >
          ← Prev
        </a>
        <span className="text-sm font-medium text-zinc-300">{weekLabel}</span>
        {isCurrentWeek ? (
          <span className="text-sm text-zinc-600 px-2 py-1">Next →</span>
        ) : (
          <a
            href={`/dashboard?week=${nextWeek.toISOString().slice(0, 10)}`}
            className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800/50"
          >
            Next →
          </a>
        )}
        {!isCurrentWeek && (
          <a
            href="/dashboard"
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Today
          </a>
        )}
      </div>

      {/* ── Streak Card ─────────────────────────────────── */}
      <StreakCard
        currentStreak={weeklyStreak}
        longestStreak={longestStreak}
        workoutsThisWeek={totalWeeklyWorkouts}
        targetDays={streakTarget}
      />

      {/* ── Stats Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Weekly Volume"
          value={`${Math.round(totalWeeklyVolume).toLocaleString()} kg`}
          icon={Weight}
          accent="amber"
        />
        <StatsCard
          label="Workouts This Week"
          value={String(totalWeeklyWorkouts)}
          icon={Dumbbell}
          accent="blue"
        />
        <StatsCard
          label="Total Time"
          value={timeStr}
          icon={Clock}
          accent="emerald"
        />
        <StatsCard
          label="Challenge Wins"
          value={String(challengeWins)}
          icon={Trophy}
          accent="violet"
        />
      </div>

      {/* ── Charts Row ──────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Volume Bar Chart */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">
                Daily Volume
              </h3>
            </div>
            <WeekNavInline
              prevWeek={prevWeek.toISOString().slice(0, 10)}
              nextWeek={nextWeek.toISOString().slice(0, 10)}
              isCurrentWeek={isCurrentWeek}
            />
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            {isCurrentWeek ? "This week" : weekLabel}
          </p>
          <WeeklyVolumeChart data={weeklyBarData} />
        </div>

        {/* Muscle Group Donut */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-white">
                Muscle Groups
              </h3>
            </div>
            <WeekNavInline
              prevWeek={prevWeek.toISOString().slice(0, 10)}
              nextWeek={nextWeek.toISOString().slice(0, 10)}
              isCurrentWeek={isCurrentWeek}
            />
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            {isCurrentWeek ? "Weekly volume breakdown" : weekLabel}
          </p>
          <MuscleGroupDonut data={donutData} />
        </div>
      </div>

      {/* ── Volume Trend ────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">
              Volume Trend
            </h3>
          </div>
          <WeekNavInline
            prevWeek={prevWeek.toISOString().slice(0, 10)}
            nextWeek={nextWeek.toISOString().slice(0, 10)}
            isCurrentWeek={isCurrentWeek}
          />
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          {isCurrentWeek ? "Last 4 weeks" : `4 weeks ending ${weekEndLabel.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
        </p>
        <VolumeTrendChart data={weeklyTotals} />
      </div>

      {/* ── Heatmap + Recent Workouts ───────────────────── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">
              🔥 Activity Heatmap
            </h3>
            <WeekNavInline
              prevWeek={prevWeek.toISOString().slice(0, 10)}
              nextWeek={nextWeek.toISOString().slice(0, 10)}
              isCurrentWeek={isCurrentWeek}
            />
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            {isCurrentWeek
              ? "Last 12 weeks"
              : `12 weeks ending ${weekEndLabel.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          </p>
          <WorkoutHeatmap data={heatmapDays} weeks={12} />
        </div>

        {/* Recent Workouts + Top Exercises */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Exercises */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">
              🏆 Top Exercises
            </h3>
            {topExercises.length > 0 ? (
              <div className="space-y-3">
                {topExercises.map((ex, i) => (
                  <div key={ex.title} className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold w-5 ${
                        i === 0
                          ? "text-amber-400"
                          : i === 1
                            ? "text-zinc-400"
                            : "text-zinc-600"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300 truncate">
                        {ex.title}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-white tabular-nums shrink-0">
                      {Math.round(ex.volume).toLocaleString()} kg
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 text-center py-4">
                No data this week
              </p>
            )}
          </div>

          {/* Recent Workouts */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">
              📋 Recent Workouts
            </h3>
            {recentWorkouts.length > 0 ? (
              <div className="space-y-2">
                {recentWorkouts.slice(0, 5).map((w) => {
                  let vol = 0;
                  for (const e of w.exercises) {
                    for (const s of e.sets) {
                      if (s.weightKg && s.reps) vol += s.weightKg * s.reps;
                    }
                  }
                  const date = new Date(w.startTime);
                  const isToday =
                    getDateStr(date) === getDateStr(new Date());

                  return (
                    <div
                      key={w.id}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="text-center shrink-0 w-10">
                        <p className="text-xs font-medium text-zinc-400">
                          {date.getDate()}
                        </p>
                        <p className="text-[10px] text-zinc-600">
                          {DAY_NAMES[date.getDay()]}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-200 truncate">
                          {w.title}
                          {isToday && (
                            <span className="ml-1.5 text-[10px] text-emerald-400 font-medium">
                              TODAY
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {w.exercises.length} exercise{w.exercises.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-white tabular-nums shrink-0">
                        {Math.round(vol).toLocaleString()} kg
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">🏋️</p>
                <p className="text-sm text-zinc-500 mb-4">
                  No workouts yet. Import your first CSV to get started.
                </p>
                <Link
                  href="/dashboard/import"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors"
                >
                  Import Workouts
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction
          title="Import CSV"
          desc="Upload your Hevy data"
          href="/dashboard/import"
          emoji="📤"
        />
        <QuickAction
          title="My Crews"
          desc="Create or join a crew"
          href="/dashboard/crews"
          emoji="👥"
        />
        <QuickAction
          title="Challenges"
          desc="Weekly competitions"
          href="/dashboard/challenges"
          emoji="⚔️"
        />
        <QuickAction
          title="Profile"
          desc="Manage your account"
          href="/dashboard/profile"
          emoji="⚙️"
        />
      </div>
    </main>
  );
}

// ── Quick Action Card ─────────────────────────────────────

function QuickAction({
  title,
  desc,
  href,
  emoji,
}: {
  title: string;
  desc: string;
  href: string;
  emoji: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 hover:bg-zinc-900 transition-all group"
    >
      <span className="text-2xl">{emoji}</span>
      <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-amber-400 transition-colors">
        {title}
      </h3>
      <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
    </Link>
  );
}
