import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {session.user.name ?? "Athlete"}
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
        <StatCard label="Workouts This Week" value="—" />
        <StatCard label="Weekly Volume" value="—" />
        <StatCard label="Current Streak" value="—" />
        <StatCard label="Challenge Wins" value="—" />
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
