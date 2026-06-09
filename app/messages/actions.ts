"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { authorizeConversation } from "@/lib/chat";

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

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return { error: "Message can't be empty." };

  await prisma.message.create({
    data: { instructorId, learnerId, senderId: party.meId, body: parsed.data },
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
