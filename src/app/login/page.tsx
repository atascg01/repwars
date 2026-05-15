"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email o contraseña incorrectos");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al crear la cuenta");
        setLoading(false);
        return;
      }

      // Auto sign in after signup
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Cuenta creada, pero no se pudo iniciar sesión. Intenta desde la pestaña Iniciar Sesión.");
        setTab("login");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Error al crear la cuenta");
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-tight">⚔️</h1>
          <h2 className="text-3xl font-bold">RepWars</h2>
          <p className="text-zinc-400 text-lg">
            Compete with your crew. Break PRs. Win badges.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-zinc-900 p-1">
          <button
            onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === "login"
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setTab("signup"); setError(""); }}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === "signup"
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={tab === "login" ? handleLogin : handleSignup}
          className="space-y-4"
        >
          {tab === "signup" && (
            <input
              type="text"
              placeholder="Nombre (opcional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-zinc-600 transition-colors"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-zinc-600 transition-colors"
          />

          <input
            type="password"
            placeholder="Contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={tab === "signup" ? 8 : undefined}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-zinc-600 transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading
              ? "Cargando..."
              : tab === "login"
                ? "Iniciar Sesión"
                : "Crear Cuenta"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-600">o</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Discord */}
        <Link
          href="/login/discord"
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#4752C4] transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          Continuar con Discord
        </Link>

        <p className="text-sm text-zinc-600">
          Connect your Hevy data and compete with your gym crew.
        </p>
      </div>
    </main>
  );
}
