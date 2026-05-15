import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcWeeklyStreak } from "@/lib/streaks";
import { Providers } from "@/app/providers";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { DataWarningBanner } from "@/components/onboarding/data-warning-banner";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  let hasData = true;
  let streak = 0;

  if (userId) {
    const [workoutCount, user, allWorkoutDates] = await Promise.all([
      prisma.workout.count({ where: { userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { hevyApiKeyEncrypted: true, weeklyStreakTarget: true },
      }),
      prisma.workout.findMany({
        where: { userId },
        select: { startTime: true },
        orderBy: { startTime: "desc" },
      }),
    ]);
    hasData = workoutCount > 0 || !!user?.hevyApiKeyEncrypted;

    const trainingDays = new Set(
      allWorkoutDates.map((w) => w.startTime.toISOString().slice(0, 10)),
    );
    streak = calcWeeklyStreak(trainingDays, user?.weeklyStreakTarget ?? 3);
  }

  return (
    <Providers>
      <ToastProvider>
        <TooltipProvider>
          <DashboardNav streak={streak} />
          <DataWarningBanner show={!hasData} />
          <OnboardingModal show={!hasData} />
          {children}
        </TooltipProvider>
      </ToastProvider>
    </Providers>
  );
}
