import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekNavInlineProps {
  prevWeek: string;
  nextWeek: string;
  isCurrentWeek: boolean;
}

export function WeekNavInline({
  prevWeek,
  nextWeek,
  isCurrentWeek,
}: WeekNavInlineProps) {
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/dashboard?week=${prevWeek}`}
        className="p-1 rounded hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-300"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Link>
      {isCurrentWeek ? (
        <span className="p-1 text-zinc-700">
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      ) : (
        <Link
          href={`/dashboard?week=${nextWeek}`}
          className="p-1 rounded hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-300"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
