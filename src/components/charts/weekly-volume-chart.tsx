"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WeeklyVolumeChartProps {
  data: { day: string; volume: number; label: string }[];
}

const GRADIENT_ID = "volumeBarGradient";

export function WeeklyVolumeChart({ data }: WeeklyVolumeChartProps) {
  const maxVolume = Math.max(...data.map((d) => d.volume), 1);

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
          <defs>
            <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload;
              return (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                  <p className="text-xs text-zinc-400">{item.label}</p>
                  <p className="text-sm font-bold text-white tabular-nums">
                    {item.volume.toLocaleString()} kg
                  </p>
                </div>
              );
            }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar
            dataKey="volume"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.volume === maxVolume && entry.volume > 0
                    ? "url(#volumeBarGradient)"
                    : entry.volume > 0
                      ? "#3b3b40"
                      : "#27272a"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
