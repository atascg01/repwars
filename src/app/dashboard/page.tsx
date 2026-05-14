import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // ── User profile ──
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      displayName: true,
      currentStreak: true,
      longestStreak: true,
      totalVolumeLifted: true,
    },
  });

  // ── Weekly stats ──
  const monday = getWeekStart();
  const weekWorkouts = await prisma.workout.findMany({
    where: { userId, startTime: { gte: monday } },
    include: { exercises: { include: { sets: true } } },
  });

  let weeklyVolume = 0;
  for (const w of weekWorkouts) {
    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (s.weightKg && s.reps) {
          weeklyVolume += s.weightKg * s.reps;
        }
      }
    }
  }

  // ── Challenge wins ──
  const challengeWins = await prisma.challengeParticipant.count({
    where: { userId, rank: 1 },
  });

  // ── Recent workouts ──
  const recentWorkouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { startTime: "desc" },
    take: 5,
    include: {
      exercises: { include: { sets: true } },
    },
  });

  return (
    <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.displayName ?? session.user.name ?? "Athlete"}
          </h1>
          <p className="text-zinc-500">Your command center</p>
        </div>
        <Link
          href="/api/auth/signout"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          Sign out
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Workouts This Week"
          value={String(weekWorkouts.length)}
        />
        <StatCard
          label="Weekly Volume"
          value={`${Math.round(weeklyVolume).toLocaleString()} kg`}
        />
        <StatCard
          label="Current Streak"
          value={user?.currentStreak ? `${user.currentStreak}d` : "—"}
        />
        <StatCard
          label="Challenge Wins"
          value={String(challengeWins)}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <ActionCard
          title="Import Workouts"
          desc="Upload your Hevy CSV"
          href="/dashboard/import"
          icon="📤"
        />
        <ActionCard
          title="My Crews"
          desc="Create or join a crew"
          href="/dashboard/crews"
          icon="👥"
        />
        <ActionCard
          title="Challenges"
          desc="Active weekly competitions"
          href="/dashboard/challenges"
          icon="⚔️"
        />
      </div>

      {/* Recent Workouts */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Recent Workouts</h2>
        <div className="rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          {recentWorkouts.length > 0 ? (
            recentWorkouts.map((w) => {
              let vol = 0;
              for (const e of w.exercises) {
                for (const s of e.sets) {
                  if (s.weightKg && s.reps) vol += s.weightKg * s.reps;
                }
              }
              return (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{w.title}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(w.startTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {Math.round(vol).toLocaleString()} kg
                    </p>
                    <p className="text-xs text-zinc-500">
                      {w.exercises.length} exercise{w.exercises.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-zinc-600">
              <p className="text-4xl mb-2">🏋️</p>
              <p>No workouts yet. Upload your first CSV to get started.</p>
              <Link
                href="/dashboard/import"
                className="inline-block mt-4 px-6 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors"
              >
                Import Workouts
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900/50">
      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ActionCard({
  title,
  desc,
  href,
  icon,
}: {
  title: string;
  desc: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-zinc-800 p-5 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all group"
    >
      <span className="text-2xl">{icon}</span>
      <h3 className="text-lg font-semibold mt-3 group-hover:text-white">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 mt-1">{desc}</p>
    </Link>
  );
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
