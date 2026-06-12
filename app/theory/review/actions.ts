"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { questionById } from "@/lib/theory/questions";

export type FeedbackState = { ok?: boolean; error?: string } | undefined;

export async function submitTheoryFeedback(
  questionId: string,
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You're not signed in." };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { instructorProfile: { select: { id: true } } },
  });
  if (!user || user.role !== "INSTRUCTOR" || !user.instructorProfile) {
    return { error: "Only instructors can submit feedback." };
  }
  if (!questionById(questionId)) return { error: "Unknown question." };

  const comment = ((formData.get("comment") as string | null) ?? "").trim();
  if (comment.length < 3) return { error: "Add a short note about the issue." };
  if (comment.length > 1000) return { error: "Please keep it under 1000 characters." };

  await prisma.theoryFeedback.create({
    data: { questionId, instructorId: user.instructorProfile.id, comment },
  });

  revalidatePath("/theory/review");
  return { ok: true };
}
