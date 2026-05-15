import Link from "next/link";
import { ScrollText } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <ScrollText className="h-6 w-6 text-amber-400" />
        <h1 className="text-2xl font-bold">Terms of Service</h1>
      </div>
      <p className="text-sm text-zinc-500">Last updated: May 2026</p>

      <section className="space-y-4 text-sm text-zinc-300 leading-relaxed">
        <h2 className="text-lg font-semibold text-white mt-6">1. Acceptance</h2>
        <p>By using RepWars, you agree to these terms. We may update them from time to time.</p>

        <h2 className="text-lg font-semibold text-white mt-6">2. Service Description</h2>
        <p>RepWars is a competitive social platform for strength training. It imports workout data from Hevy and provides crew-based challenges, leaderboards, streaks, and badges.</p>

        <h2 className="text-lg font-semibold text-white mt-6">3. User Conduct</h2>
        <p>Be respectful. Don&apos;t manipulate data to cheat in challenges. We reserve the right to suspend accounts that violate fair play.</p>

        <h2 className="text-lg font-semibold text-white mt-6">4. Third-Party Services</h2>
        <p>RepWars integrates with Hevy via API. You are responsible for complying with Hevy&apos;s terms of service. Hevy Pro subscription is required for API access.</p>

        <h2 className="text-lg font-semibold text-white mt-6">5. Limitation of Liability</h2>
        <p>RepWars is provided &quot;as is&quot;. We are not liable for any damages arising from use of the service.</p>

        <h2 className="text-lg font-semibold text-white mt-6">6. Contact</h2>
        <p>For questions about these terms, reach out through our GitHub repository.</p>
      </section>

      <div className="pt-4">
        <Link href="/" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
          ← Back to RepWars
        </Link>
      </div>
    </main>
  );
}
