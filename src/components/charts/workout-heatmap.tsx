"use client";

interface HeatmapDay {
  date: string;
  volume: number;
}

interface WorkoutHeatmapProps {
  data: HeatmapDay[];
  weeks: number;
}

function getIntensity(volume: number, max: number): string {
  if (volume === 0) return "bg-zinc-800/50";
  const ratio = volume / max;
  if (ratio > 0.75) return "bg-amber-500/80";
  if (ratio > 0.5) return "bg-amber-500/50";
  if (ratio > 0.25) return "bg-amber-500/30";
  return "bg-amber-500/15";
}

export function WorkoutHeatmap({ data, weeks }: WorkoutHeatmapProps) {
  const maxVol = Math.max(...data.map((d) => d.volume), 1);

  // Build grid: rows = days of week (Mon-Sun), cols = weeks
  const days = ["", "L", "", "X", "", "V", ""]; // Mon through Sun labels
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Organize data into a grid[dayOfWeek][weekIndex]
  const grid: (HeatmapDay | null)[][] = Array.from({ length: 7 }, () =>
    Array(weeks).fill(null),
  );

  for (const d of data) {
    const date = new Date(d.date);
    const dayOfWeek = (date.getDay() + 6) % 7; // Mon=0, Sun=6
    // Find which week this belongs to
    const weekIndex = Math.floor(
      (date.getTime() - getStartDate(weeks).getTime()) / (7 * 86400000),
    );
    if (weekIndex >= 0 && weekIndex < weeks) {
      grid[dayOfWeek][weekIndex] = d;
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-0.5 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1.5 justify-between py-0.5">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="h-3 w-6 flex items-center text-[9px] text-zinc-600"
            >
              {["Mon", "Wed", "Fri"].includes(label) ? label : ""}
            </div>
          ))}
        </div>

        {/* Heatmap cells */}
        {Array.from({ length: weeks }, (_, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-0.5">
            {Array.from({ length: 7 }, (_, dayIdx) => {
              const cell = grid[dayIdx][weekIdx];
              const volume = cell?.volume ?? 0;
              return (
                <div
                  key={dayIdx}
                  className={`h-3 w-3 rounded-sm ${getIntensity(volume, maxVol)}`}
                  title={
                    cell
                      ? `${cell.date}: ${cell.volume.toLocaleString()} kg`
                      : ""
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function getStartDate(weeks: number): Date {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset - (weeks - 1) * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
