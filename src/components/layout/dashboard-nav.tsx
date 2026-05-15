"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Swords,
  Upload,
  Flame,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/crews", icon: Users, label: "Crews" },
  { href: "/dashboard/challenges", icon: Swords, label: "Challenges" },
  { href: "/dashboard/import", icon: Upload, label: "Import" },
];

export function DashboardNav({ streak = 0 }: { streak?: number }) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold shrink-0"
          >
            <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black text-xs">
              ⚔️
            </span>
            <span className="hidden sm:inline text-white">RepWars</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side: Streak + Profile */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Streak Display */}
            <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-1.5">
              <Flame className={`h-4 w-4 ${streak > 0 ? "text-orange-400" : "text-zinc-600"}`} />
              <span className={`text-sm font-semibold ${streak > 0 ? "text-orange-400" : "text-zinc-500"}`}>
                {streak}
              </span>
              <span className="text-xs text-zinc-500">w</span>
            </div>

            {/* Profile */}
            <Link
              href="/dashboard/profile"
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                pathname === "/dashboard/profile"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              )}
            >
              <User className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
