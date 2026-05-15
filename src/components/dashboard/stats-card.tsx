import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: "amber" | "blue" | "emerald" | "violet" | "rose";
}

const accentStyles = {
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/20",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
  },
};

export function StatsCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "amber",
}: StatsCardProps) {
  const style = accentStyles[accent];

  return (
    <div
      className={`rounded-2xl border ${style.border} bg-zinc-900/50 p-5 relative overflow-hidden group hover:bg-zinc-900 transition-all`}
    >
      {/* Background glow */}
      <div className={`absolute -top-4 -right-4 h-20 w-20 rounded-full ${style.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-zinc-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-white tabular-nums tracking-tight">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-zinc-500">{sub}</p>
          )}
        </div>
        <div className={`h-10 w-10 rounded-xl ${style.bg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${style.text}`} />
        </div>
      </div>
    </div>
  );
}
