"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MuscleGroupDonutProps {
  data: { name: string; volume: number; color: string }[];
}

export function MuscleGroupDonut({ data }: MuscleGroupDonutProps) {
  const total = data.reduce((sum, d) => sum + d.volume, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
        Sin datos esta semana
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="volume"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload;
              const pct = total > 0 ? ((item.volume / total) * 100).toFixed(0) : 0;
              return (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                  <p className="text-xs font-medium" style={{ color: item.color }}>
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-white tabular-nums">
                    {item.volume.toLocaleString()} kg
                    <span className="text-zinc-500 font-normal ml-1">
                      ({pct}%)
                    </span>
                  </p>
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-zinc-400">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
