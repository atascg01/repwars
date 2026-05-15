import Link from "next/link";
import { signIn } from "@/lib/auth";
import {
  Swords,
  Trophy,
  Dumbbell,
  Flame,
  Users,
  Zap,
  BadgeCheck,
  TrendingUp,
  Globe,
  ArrowRight,
  Crown,
  Weight,
  BarChart3,
  ShieldCheck,
  Star,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex-1">
      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
              <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black text-sm">
                ⚔️
              </span>
              <span className="text-white">RepWars</span>
            </Link>
            <div className="flex items-center gap-4">
              <a
                href="#features"
                className="hidden sm:block text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="hidden sm:block text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                How It Works
              </a>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
              >
                Get Started
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-sm text-amber-400 mb-8 animate-fade-in">
              <Flame className="h-4 w-4" />
              The Strava for lifting is here
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] animate-slide-up stagger-1">
              Your Gym Crew.
              <br />
              <span className="text-gradient">One Leaderboard.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto animate-slide-up stagger-2 leading-relaxed">
              Import your Hevy workouts, join a crew, and compete in weekly
              challenges. Iron King. PR Breaker. Grinder. Who runs your gym?
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-3">
              <Link
                href="/login"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-black hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start Competing</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-8 py-4 text-lg font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-all"
              >
                How It Works
              </a>
            </div>

            {/* Stats Row */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in stagger-5">
              {[
                { value: "13M+", label: "Hevy users to connect" },
                { value: "5", label: "Challenge types" },
                { value: "0€", label: "Start for free" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Card */}
          <div className="mt-16 max-w-3xl mx-auto animate-slide-up stagger-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden shadow-2xl shadow-amber-500/5">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-5 rounded-md bg-zinc-800 text-[10px] text-zinc-500 flex items-center justify-center">
                    repwars.app/challenges/iron-king-w20
                  </div>
                </div>
              </div>
              {/* Podium Preview */}
              <div className="p-6 sm:p-8">
                <div className="flex items-end justify-center gap-4 sm:gap-8 h-40 sm:h-48">
                  {/* 2nd */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-zinc-400 flex items-center justify-center text-black font-bold text-xs">
                      MA
                    </div>
                    <div className="w-16 sm:w-20 bg-zinc-400 rounded-t-lg h-20 sm:h-24 flex items-end justify-center pb-2">
                      <span className="text-black font-bold text-xs">76k</span>
                    </div>
                    <span className="h-6 w-6 rounded-full bg-zinc-400 flex items-center justify-center text-black font-bold text-[10px]">
                      2
                    </span>
                  </div>
                  {/* 1st */}
                  <div className="flex flex-col items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-400 -mb-1" />
                    <div className="h-9 w-9 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-xs">
                      AN
                    </div>
                    <div className="w-20 sm:w-24 bg-amber-500 rounded-t-lg h-28 sm:h-32 flex items-end justify-center pb-2">
                      <span className="text-black font-bold text-sm">84k</span>
                    </div>
                    <span className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-[10px]">
                      1
                    </span>
                  </div>
                  {/* 3rd */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-amber-800 flex items-center justify-center text-amber-200 font-bold text-xs">
                      CR
                    </div>
                    <div className="w-16 sm:w-20 bg-amber-800 rounded-t-lg h-16 sm:h-20 flex items-end justify-center pb-2">
                      <span className="text-amber-200 font-bold text-xs">
                        58k
                      </span>
                    </div>
                    <span className="h-6 w-6 rounded-full bg-amber-800 flex items-center justify-center text-amber-200 font-bold text-[10px]">
                      3
                    </span>
                  </div>
                </div>
                <p className="text-center text-sm text-zinc-500 mt-4">
                  Iron King — Week 20 · 12 participants · 3 days left
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="text-gradient">dominate</span>
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              From casual lifters to competitive beasts — RepWars turns every
              workout into a battle.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Swords className="h-6 w-6" />,
                title: "Weekly Challenges",
                desc: "Iron King for volume. PR Breaker for records. Grinder for intensity. New battles every week with your crew.",
                color: "from-amber-500/10 to-amber-500/5",
                border: "border-amber-500/20",
                iconColor: "text-amber-400",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Crews",
                desc: "Create your gym squad. Invite friends. Private or public — your crew, your rules. Feed, roster, challenges, all in one place.",
                color: "from-blue-500/10 to-blue-500/5",
                border: "border-blue-500/20",
                iconColor: "text-blue-400",
              },
              {
                icon: <Trophy className="h-6 w-6" />,
                title: "Live Leaderboards",
                desc: "Watch ranks shift in real time as your crew logs workouts. Podium celebrations at the end of every challenge.",
                color: "from-yellow-500/10 to-yellow-500/5",
                border: "border-yellow-500/20",
                iconColor: "text-yellow-400",
              },
              {
                icon: <BadgeCheck className="h-6 w-6" />,
                title: "Badge System",
                desc: "Earn 20+ badges across 6 categories. Streak flame, volume milestones, PR hunter, challenge champion. Show off your grind.",
                color: "from-emerald-500/10 to-emerald-500/5",
                border: "border-emerald-500/20",
                iconColor: "text-emerald-400",
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Smart Analytics",
                desc: "Weekly volume by muscle group. PR timeline. GitHub-style workout heatmap. Know your numbers, break your limits.",
                color: "from-violet-500/10 to-violet-500/5",
                border: "border-violet-500/20",
                iconColor: "text-violet-400",
              },
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "Your Data, Your Rules",
                desc: "Free CSV import from Hevy. Automatic sync with Hevy Pro. Verified badges for trusted data. No lock-in.",
                color: "from-rose-500/10 to-rose-500/5",
                border: "border-rose-500/20",
                iconColor: "text-rose-400",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`group relative rounded-2xl border ${feature.border} bg-gradient-to-b ${feature.color} p-6 hover:scale-[1.02] transition-all duration-300 cursor-default`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className={`h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-4 ${feature.iconColor}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Challenge Types ──────────────────────────────── */}
      <section className="py-24 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Five ways to <span className="text-gradient">battle</span>
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Pick your poison. Different challenges for different beasts.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                icon: <Weight className="h-6 w-6" />,
                title: "Iron King",
                desc: "Highest total volume lifted this week. Every rep counts. Pure strength.",
                color: "border-amber-500/30 bg-amber-500/5",
                iconColor: "text-amber-400",
                unit: "total kg",
              },
              {
                icon: <Flame className="h-6 w-6" />,
                title: "Grinder",
                desc: "Biggest single workout. One session to rule them all. Leave it all on the floor.",
                color: "border-red-500/30 bg-red-500/5",
                iconColor: "text-red-400",
                unit: "session kg",
              },
              {
                icon: <Zap className="h-6 w-6" />,
                title: "PR Breaker",
                desc: "Most personal records broken. Beat your past self. Over and over.",
                color: "border-violet-500/30 bg-violet-500/5",
                iconColor: "text-violet-400",
                unit: "PRs broken",
              },
              {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Consistency",
                desc: "Most workout days logged. Show up. Every. Single. Day.",
                color: "border-emerald-500/30 bg-emerald-500/5",
                iconColor: "text-emerald-400",
                unit: "workouts",
              },
              {
                icon: <Star className="h-6 w-6" />,
                title: "Custom",
                desc: "You pick the exercise. Bench, squat, curls — your battle, your rules.",
                color: "border-sky-500/30 bg-sky-500/5",
                iconColor: "text-sky-400",
                unit: "exercise kg",
              },
            ].map((type) => (
              <div
                key={type.title}
                className={`rounded-2xl border ${type.color} p-6 text-center hover:scale-[1.03] transition-all duration-300`}
              >
                <div className={`${type.iconColor} mb-3 flex justify-center`}>
                  {type.icon}
                </div>
                <h3 className="font-bold text-lg mb-1.5">{type.title}</h3>
                <p className="text-sm text-zinc-400 mb-3">{type.desc}</p>
                <span className="text-[11px] uppercase tracking-wider text-zinc-600">
                  {type.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Three steps to <span className="text-gradient">glory</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: <Dumbbell className="h-8 w-8" />,
                title: "Connect Your Data",
                desc: "Drag & drop your Hevy CSV export. Or link your Hevy Pro API key for automatic daily sync. Your workouts, your data, your control.",
                color: "border-amber-500/30",
                glow: "shadow-amber-500/10",
              },
              {
                step: "02",
                icon: <Users className="h-8 w-8" />,
                title: "Join Your Crew",
                desc: "Create a crew or join with an invite code. See your squad's feed, track everyone's progress, and talk smack.",
                color: "border-blue-500/30",
                glow: "shadow-blue-500/10",
              },
              {
                step: "03",
                icon: <Swords className="h-8 w-8" />,
                title: "Compete & Conquer",
                desc: "Enter weekly challenges. Climb the leaderboard. Earn badges. Win bragging rights. Repeat forever.",
                color: "border-amber-500/30",
                glow: "shadow-amber-500/10",
              },
            ].map((step) => (
              <div
                key={step.step}
                className={`relative rounded-2xl border ${step.color} bg-zinc-900/50 p-8 text-center group hover:scale-[1.02] transition-all duration-300 hover:${step.glow}`}
              >
                <span className="text-5xl font-black text-zinc-800 group-hover:text-zinc-700 transition-colors">
                  {step.step}
                </span>
                <div className="h-14 w-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto -mt-4 mb-5 text-zinc-400 group-hover:text-white transition-colors">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent p-10 sm:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Ready to <span className="text-gradient">dominate</span>?
              </h2>
              <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
                Join the first competitive platform for lifters. Import your
                Hevy data and start battling your crew today. Free.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-lg font-bold text-black hover:bg-amber-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Swords className="h-5 w-5" />
                  Start Battling
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <p className="mt-6 text-sm text-zinc-600">
                No credit card. No Hevy Pro required. Just your CSV and the will
                to win.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="h-6 w-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black text-[10px]">
                ⚔️
              </span>
              RepWars · Built for lifters, by lifters
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-600">
              <a href="#" className="hover:text-zinc-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-zinc-400 transition-colors">
                Terms
              </a>
              <a
                href="https://github.com/atascg01/repwars"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-400 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
