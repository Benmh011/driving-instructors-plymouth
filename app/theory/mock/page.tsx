import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import QuestionRunner from "@/components/theory/QuestionRunner";
import { theoryAccess } from "@/lib/theory/access";
import {
  QUESTIONS,
  MOCK_COUNT,
  MOCK_PASS_MARK,
  MOCK_TIME_SECONDS,
} from "@/lib/theory/questions";

export const metadata = { title: "Mock theory test" };

export default async function MockTestPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const gate = await theoryAccess();
  if (!gate.ok) redirect("/theory");

  // Instructors preview from their review page, so send them back there.
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isInstructor = me?.role === "INSTRUCTOR";
  const backHref = isInstructor ? "/theory/review" : "/theory";
  const backLabel = isInstructor ? "Review" : "Theory";

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <BackLink href={backHref} label={backLabel} />
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Mock test
        </h1>
        <QuestionRunner
          questions={QUESTIONS}
          mode="mock"
          mockCount={MOCK_COUNT}
          passMark={MOCK_PASS_MARK}
          timeSeconds={MOCK_TIME_SECONDS}
          title="Mock test"
          backHref={backHref}
        />
      </main>
    </div>
  );
}
