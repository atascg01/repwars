"use client";

import { useState } from "react";

interface HeatmapDay {
  date: string;
  volume: number;
}

interface WorkoutHeatmapProps {
  data: HeatmapDay[];
  weeks: number;
}

function getIntensity(volume: number, max: number): string {
  if (volume === 0) return "bg-zinc-800/40";
  const ratio = volume / max;
  if (ratio > 0.75) return "bg-amber-500";
  if (ratio > 0.5) return "bg-amber-500/65";
  if (ratio > 0.25) return "bg-amber-500/35";
  return "bg-amber-500/15";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WorkoutHeatmap({ data, weeks }: WorkoutHeatmapProps) {
  const maxVol = Math.max(...data.map((d) => d.volume), 1);
  const [hovered, setHovered] = useState<{
    date: string;
    volume: number;
    label: string;
    x: number;
    y: number;
  } | null>(null);

  // Build grid[dayIdx][weekIdx]
  const grid: (HeatmapDay | null)[][] = Array.from({ length: 7 }, () =>
    Array(weeks).fill(null),
  );

  for (const d of data) {
    const date = new Date(d.date);
    const dayOfWeek = (date.getDay() + 6) % 7;
    const weekIndex = Math.floor(
      (date.getTime() - getStartDate(weeks).getTime()) / (7 * 86400000),
    );
    if (weekIndex >= 0 && weekIndex < weeks) {
      grid[dayOfWeek][weekIndex] = d;
    }
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  const startDate = getStartDate(weeks);
  for (let w = 0; w < weeks; w++) {
    const monday = new Date(startDate);
    monday.setDate(monday.getDate() + w * 7);
    const monthName = monday.toLocaleDateString("en-US", { month: "short" });
    const prev = monthLabels[monthLabels.length - 1];
    if (!prev || prev.label !== monthName) {
      monthLabels.push({ label: monthName, col: w });
    }
  }

  const daysWithData = data.length;

  return (
    <div className="relative">
      {/* Tooltip */}
      {hovered && (
        <div
          className="fixed z-30 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 shadow-xl pointer-events-none whitespace-nowrap"
          style={{ left: hovered.x + 10, top: hovered.y - 4 }}
        >
          <p className="text-[11px] font-medium text-white">{hovered.label}</p>
          <p className="text-xs text-zinc-400 tabular-nums">
            {hovered.volume.toLocaleString()} kg
          </p>
        </div>
      )}

      {/* Heatmap */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex min-w-full">
          {/* Day labels column */}
          <div className="shrink-0 w-8">
            {/* Month header spacer */}
            <div className="h-4" />
            {/* Day labels */}
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="h-[14px] flex items-center text-[10px] text-zinc-500 mb-[3px]"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Weeks columns */}
          {Array.from({ length: weeks }, (_, weekIdx) => (
            <div key={weekIdx} className="flex-1 min-w-[12px] px-[1.5px]">
              {/* Month label */}
              {monthLabels.some((m) => m.col === weekIdx) ? (
                <div className="h-4 text-[10px] text-zinc-500 truncate">
                  {monthLabels.find((m) => m.col === weekIdx)?.label ?? ""}
                </div>
              ) : (
                <div className="h-4" />
              )}

              {/* Day cells */}
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const cell = grid[dayIdx][weekIdx];
                const volume = cell?.volume ?? 0;
                const hasData = volume > 0;

                return (
                  <div
                    key={dayIdx}
                    className={`h-[14px] w-full rounded-[3px] mb-[3px] transition-colors ${
                      hasData
                        ? `${getIntensity(volume, maxVol)} cursor-pointer hover:ring-[1.5px] hover:ring-white/40`
                        : "bg-zinc-800/25"
                    }`}
                    onMouseEnter={(e) => {
                      if (hasData && cell) {
                        setHovered({
                          date: cell.date,
                          volume: cell.volume,
                          label: formatDate(cell.date),
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }
                    }}
                    onMouseMove={(e) => {
                      if (hovered) {
                        setHovered((prev) =>
                          prev ? { ...prev, x: e.clientX, y: e.clientY } : null,
                        );
                      }
                    }}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Caption */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-zinc-600">
          {daysWithData} training days across {weeks} weeks
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-600">Less</span>
          <div className="h-3 w-3 rounded-[2px] bg-zinc-800/25" />
          <div className="h-3 w-3 rounded-[2px] bg-amber-500/15" />
          <div className="h-3 w-3 rounded-[2px] bg-amber-500/35" />
          <div className="h-3 w-3 rounded-[2px] bg-amber-500/65" />
          <div className="h-3 w-3 rounded-[2px] bg-amber-500" />
          <span className="text-[10px] text-zinc-600">More</span>
        </div>
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
