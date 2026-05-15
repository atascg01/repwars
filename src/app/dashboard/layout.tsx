import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  let hasData = true; // assume true if not logged in (shouldn't happen)
  if (userId) {
    const [workoutCount, user] = await Promise.all([
      prisma.workout.count({ where: { userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { hevyApiKeyEncrypted: true },
      }),
    ]);
    hasData = workoutCount > 0 || !!user?.hevyApiKeyEncrypted;
  }

  return (
    <>
      <DashboardNav />
      <DataWarningBanner show={!hasData} />
      <OnboardingModal show={!hasData} />
      {children}
    </>
  );
}
