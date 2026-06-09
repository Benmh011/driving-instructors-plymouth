import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BottomNav from "@/components/BottomNav";
import Conversation from "@/components/messages/Conversation";
import { authorizeConversation } from "@/lib/chat";

export const metadata = { title: "Messages" };

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ learnerId: string }>;
}) {
  const { learnerId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!instructor) redirect("/messages");

  const party = await authorizeConversation(session.user.id, instructor.id, learnerId);
  if (!party) redirect("/messages");

  const initial = await prisma.message.findMany({
    where: { instructorId: instructor.id, learnerId },
    orderBy: { createdAt: "asc" },
    select: { id: true, senderId: true, body: true, createdAt: true },
  });

  await prisma.message.updateMany({
    where: { instructorId: instructor.id, learnerId, senderId: { not: party.meId }, readAt: null },
    data: { readAt: new Date() },
  });

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />
      <main className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-12">
        <Link
          href="/messages"
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; All messages
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
          {party.learnerName}
        </h1>
        <div className="mt-5">
          <Conversation
            instructorId={instructor.id}
            learnerId={learnerId}
            meId={party.meId}
            otherName={party.learnerName}
            initial={initial.map((m: { id: string; senderId: string; body: string; createdAt: Date }) => ({
              id: m.id,
              senderId: m.senderId,
              body: m.body,
              createdAt: m.createdAt.toISOString(),
            }))}
          />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
