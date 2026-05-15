import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepWars — Gym Competitions & Streaks",
  description:
    "Compete with your crew. Break PRs. Win badges. The Strava for lifting. Import your Hevy workouts, join a crew, and compete in weekly challenges.",
  openGraph: {
    title: "RepWars — Gym Competitions & Streaks",
    description:
      "Compete with your crew. Break PRs. Win badges. Import your Hevy workouts and battle your friends.",
    url: "https://repwars.vercel.app",
    siteName: "RepWars",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepWars",
    description: "Compete with your crew. Break PRs. Win badges.",
  },
};

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "RepWars",
  description:
    "Compete with your crew. Break PRs. Win badges. The Strava for lifting.",
  url: "https://repwars.vercel.app",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full dark antialiased`}
    >
      <head>
        <link rel="canonical" href="https://repwars.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
