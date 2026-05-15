import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Dumbbell, Clock, Weight } from "lucide-react";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const workout = await prisma.workout.findUnique({
    where: { id, userId: session.user.id },
    include: { exercises: { include: { sets: true }, orderBy: { sortOrder: "asc" } } },
  });

  if (!workout) {
    return (
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300">← Back</Link>
        <p className="text-zinc-500 mt-4">Workout not found</p>
      </main>
    );
  }

  const duration = (new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 60000;
  const durationStr = duration >= 60 ? `${Math.floor(duration / 60)}h ${Math.round(duration % 60)}m` : `${Math.round(duration)}m`;

  let totalVolume = 0;
  for (const e of workout.exercises) for (const s of e.sets) if (s.weightKg && s.reps) totalVolume += s.weightKg * s.reps;

  return (
    <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{workout.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{durationStr}</span>
          <span className="flex items-center gap-1"><Weight className="h-3.5 w-3.5" />{totalVolume.toLocaleString()} kg</span>
          <span>{new Date(workout.startTime).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
        {workout.description && <p className="text-sm text-zinc-500 mt-2">{workout.description}</p>}
      </div>
      <div className="space-y-4">
        {workout.exercises.map((ex) => {
          let exVol = 0;
          for (const s of ex.sets) if (s.weightKg && s.reps) exVol += s.weightKg * s.reps;
          return (
            <div key={ex.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-amber-400" />
                  <h3 className="font-semibold text-white">{ex.title}</h3>
                </div>
                {exVol > 0 && <span className="text-sm text-zinc-400 tabular-nums">{exVol.toLocaleString()} kg</span>}
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs font-medium text-zinc-500 pb-1 border-b border-zinc-800 mb-2">
                <span>Set</span><span>Type</span><span>Weight</span><span>Reps</span><span>RPE</span>
              </div>
              {ex.sets.map((s, i) => (
                <div key={s.id} className="grid grid-cols-5 gap-2 text-sm py-1.5">
                  <span className="text-zinc-500">{i + 1}</span>
                  <span className="text-zinc-400 capitalize">{s.setType}</span>
                  <span className="text-white tabular-nums font-medium">{s.weightKg ? `${s.weightKg} kg` : "—"}</span>
                  <span className="text-white tabular-nums font-medium">{s.reps ?? "—"}</span>
                  <span className="text-zinc-400 tabular-nums">{s.rpe ?? "—"}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </main>
  );
}
