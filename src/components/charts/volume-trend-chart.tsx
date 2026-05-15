"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VolumeTrendChartProps {
  data: { week: string; volume: number }[];
}

export function VolumeTrendChart({ data }: VolumeTrendChartProps) {
  const maxVol = Math.max(...data.map((d) => d.volume), 1);

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
            vertical={false}
          />
          <XAxis
            dataKey="week"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
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
                  <p className="text-xs text-zinc-400">{item.week}</p>
                  <p className="text-sm font-bold text-white tabular-nums">
                    {item.volume.toLocaleString()} kg
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#trendGradient)"
            dot={{
              r: 3,
              fill: "#3b82f6",
              stroke: "#18181b",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 5,
              fill: "#3b82f6",
              stroke: "#18181b",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
