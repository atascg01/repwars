import Link from "next/link";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-6 w-6 text-amber-400" />
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
      </div>
      <p className="text-sm text-zinc-500">Last updated: May 2026</p>

      <section className="space-y-4 text-sm text-zinc-300 leading-relaxed">
        <h2 className="text-lg font-semibold text-white mt-6">1. Data We Collect</h2>
        <p>When you connect your Hevy account, we import your workout history, including exercises, sets, reps, weights, and dates. Your Hevy API key is encrypted at rest and never shared.</p>
        <p>When you create an account, we store your email address and display name. We do not sell or share your personal data with third parties.</p>

        <h2 className="text-lg font-semibold text-white mt-6">2. How We Use Your Data</h2>
        <p>Your workout data is used to power RepWars features: crew leaderboards, weekly challenges, streak tracking, PR detection, and badge awards. You control visibility through crew privacy settings.</p>

        <h2 className="text-lg font-semibold text-white mt-6">3. Data Retention</h2>
        <p>Your data is retained as long as your account is active. You can delete your account at any time by contacting us. Workout data associated with completed challenges may be retained in anonymized form for leaderboard history.</p>

        <h2 className="text-lg font-semibold text-white mt-6">4. Security</h2>
        <p>Hevy API keys are encrypted using AES-256-GCM. All connections use HTTPS. We follow industry best practices for data protection.</p>

        <h2 className="text-lg font-semibold text-white mt-6">5. Contact</h2>
        <p>For privacy-related inquiries, contact us through our GitHub repository.</p>
      </section>

      <div className="pt-4">
        <Link href="/" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
          ← Back to RepWars
        </Link>
      </div>
    </main>
  );
}
