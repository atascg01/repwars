"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Key,
  FileUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface OnboardingModalProps {
  show: boolean;
}

const STORAGE_KEY = "repwars-onboarding-dismissed";

export function OnboardingModal({ show }: OnboardingModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if onboarding hasn't been dismissed and show=true
    if (show && !localStorage.getItem(STORAGE_KEY)) {
      // Small delay so it animates in after page load
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, [show]);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-amber-500/5 animate-in zoom-in-95 fade-in duration-300">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-7 w-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            Connect your Hevy data!
          </h2>
          <p className="text-sm text-zinc-400">
            To see your stats, streaks, and charts you need to import your
            workouts. Two options:
          </p>
        </div>

        {/* Options */}
        <div className="px-6 pb-2 space-y-3">
          {/* Option 1: API Key */}
          <Link
            href="/dashboard/import"
            onClick={dismiss}
            className="flex items-start gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 hover:bg-amber-500/10 transition-colors group"
          >
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Key className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">
                Connect API Key
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automatic daily sync. Requires Hevy Pro ($2.99/mo).
              </p>
              <p className="text-[10px] text-amber-500/70 mt-1 font-mono">
                hevy.com/settings?developer
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-amber-400 transition-colors shrink-0 mt-2.5" />
          </Link>

          {/* Option 2: CSV */}
          <Link
            href="/dashboard/import"
            onClick={dismiss}
            className="flex items-start gap-4 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 hover:bg-zinc-900 transition-colors group"
          >
            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
              <FileUp className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm group-hover:text-zinc-200 transition-colors">
                Upload CSV
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Export from the Hevy app and drag & drop the file. Free, no
                Pro required.
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Hevy app → Settings → Export Data → Download CSV
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 mt-2.5" />
          </Link>
        </div>

        {/* Footer */}
        <div className="p-6 pt-3 flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            I'll do it later
          </button>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
            <CheckCircle2 className="h-3 w-3" />
            You can change this anytime
          </div>
        </div>
      </div>
    </div>
  );
}
