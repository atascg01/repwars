"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface DataWarningBannerProps {
  show: boolean;
}

export function DataWarningBanner({ show }: DataWarningBannerProps) {
  if (!show) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-xs sm:text-sm text-amber-300/80 truncate">
            No Hevy data connected. Charts and stats will appear empty until you import your workouts.
          </p>
        </div>
        <Link
          href="/dashboard/import"
          className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors shrink-0 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg px-3 py-1.5"
        >
          <span className="hidden sm:inline">Connect</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
