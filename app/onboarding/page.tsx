import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeNext } from "@/lib/nav";
import { AuthShell } from "@/components/auth/AuthShell";
import LearnerForm from "@/components/onboarding/LearnerForm";
import InstructorForm from "@/components/onboarding/InstructorForm";

export const metadata = { title: "Set up your account" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { next: nextRaw } = await searchParams;
  const next = nextRaw ? safeNext(nextRaw, "") : "";

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");
  if (user.onboardingComplete) redirect(next || "/dashboard");

  const isInstructor = user.role === "INSTRUCTOR";

  return (
    <AuthShell
      title={isInstructor ? "Set up your instructor profile" : "A few quick details"}
      subtitle={
        isInstructor
          ? "This is what learners will see when they find you."
          : "So we can match you with the right local instructors."
      }
    >
      {isInstructor ? <InstructorForm next={next} /> : <LearnerForm next={next} />}
    </AuthShell>
  );
}
