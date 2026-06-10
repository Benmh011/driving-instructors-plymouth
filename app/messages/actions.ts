"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { authorizeConversation } from "@/lib/chat";
import { sendPushToUser } from "@/lib/push";
import { accessState, hasFullAccess } from "@/lib/subscription";

export type SendState = { error?: string } | undefined;

const bodySchema = z.string().trim().min(1).max(2000);

export async function sendMessage(
  instructorId: string,
  learnerId: string,
  raw: string,
): Promise<SendState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You're not signed in." };

  const party = await authorizeConversation(session.user.id, instructorId, learnerId);
  if (!party) return { error: "You can't message here." };

  // A locked instructor can't start/continue messaging; the learner still can.
  if (party.role === "INSTRUCTOR") {
    const inst = await prisma.instructorProfile.findUnique({
      where: { id: instructorId },
      select: {
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
      },
    });
    if (inst && !hasFullAccess(accessState(inst))) {
      return {
        error: "Your subscription has ended — resubscribe to message students.",
      };
    }
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return { error: "Message can't be empty." };

  await prisma.message.create({
    data: { instructorId, learnerId, senderId: party.meId, body: parsed.data },
  });

  // Notify the *other* party on their devices (best-effort).
  const recipientUserId =
    party.role === "INSTRUCTOR" ? party.learnerUserId : party.instructorUserId;
  const senderName =
    party.role === "INSTRUCTOR" ? party.instructorName : party.learnerName;
  // Instructors land in the specific thread; learners have a single thread.
  const url = party.role === "INSTRUCTOR" ? "/messages" : `/messages/${learnerId}`;
  const preview =
    parsed.data.length > 120 ? `${parsed.data.slice(0, 117)}…` : parsed.data;
  await sendPushToUser(recipientUserId, {
    title: `New message from ${senderName}`,
    body: preview,
    url,
    tag: `chat-${instructorId}-${learnerId}`,
  });

  revalidatePath("/messages");
  revalidatePath(`/messages/${learnerId}`);
  return undefined;
}

export async function markRead(instructorId: string, learnerId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const party = await authorizeConversation(session.user.id, instructorId, learnerId);
  if (!party) return;

  await prisma.message.updateMany({
    where: { instructorId, learnerId, senderId: { not: party.meId }, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/messages");
}
