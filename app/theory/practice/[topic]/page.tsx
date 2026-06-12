import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import QuestionRunner from "@/components/theory/QuestionRunner";
import { theoryAccess } from "@/lib/theory/access";
import { topicFromSlug, questionsForTopic } from "@/lib/theory/questions";

export const metadata = { title: "Theory practice" };

export default async function PracticeTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const gate = await theoryAccess();
  if (!gate.ok) redirect("/theory");

  const { topic: slug } = await params;
  const topic = topicFromSlug(slug);
  if (!topic) redirect("/theory");

  const questions = questionsForTopic(topic);
  if (questions.length === 0) redirect("/theory");

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <BackLink href="/theory" label="Theory" />
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {topic}
        </h1>
        <QuestionRunner
          questions={questions}
          mode="practice"
          title={topic}
          backHref="/theory"
        />
      </main>
    </div>
  );
}
