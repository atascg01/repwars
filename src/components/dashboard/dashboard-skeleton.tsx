export function DashboardSkeleton() {
  return (
    <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-zinc-800 rounded-lg" />
          <div className="h-4 w-32 bg-zinc-800 rounded" />
        </div>
      </div>

      {/* Week nav skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-16 bg-zinc-800 rounded-lg" />
        <div className="h-5 w-40 bg-zinc-800 rounded" />
        <div className="h-8 w-16 bg-zinc-800 rounded-lg" />
      </div>

      {/* Streak card skeleton */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-8 w-24 bg-zinc-800 rounded-lg" />
            <div className="h-3 w-20 bg-zinc-800 rounded" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-zinc-800 rounded" />
            <div className="h-3 w-12 bg-zinc-800 rounded" />
          </div>
          <div className="h-2 rounded-full bg-zinc-800" />
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <div className="h-3 w-20 bg-zinc-800 rounded mb-2" />
            <div className="h-7 w-16 bg-zinc-800 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="h-4 w-28 bg-zinc-800 rounded mb-4" />
          <div className="h-64 bg-zinc-800/50 rounded-lg" />
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="h-4 w-32 bg-zinc-800 rounded mb-4" />
          <div className="h-64 bg-zinc-800/50 rounded-lg" />
        </div>
      </div>
    </main>
  );
}
