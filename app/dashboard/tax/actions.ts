"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ActionState = { error?: string } | undefined;

const expenseSchema = z.object({
  date: z.string().min(1, "Pick a date."),
  amount: z.coerce.number().positive("Enter an amount.").max(100000),
  category: z.string().min(1, "Choose a category."),
  note: z.string().max(200).optional(),
});

export async function addExpense(
  year: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!instructor) redirect("/dashboard");

  const parsed = expenseSchema.safeParse({
    date: formData.get("date"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the details." };
  }

  const date = new Date(parsed.data.date);
  if (Number.isNaN(date.getTime())) return { error: "That date didn't look right." };

  await prisma.expense.create({
    data: {
      instructorId: instructor.id,
      date,
      amountPence: Math.round(parsed.data.amount * 100),
      category: parsed.data.category,
      note: parsed.data.note ?? null,
    },
  });

  redirect(`/dashboard/tax?year=${year}`);
}

export async function deleteExpense(expenseId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!instructor) return;

  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense || expense.instructorId !== instructor.id) return;

  await prisma.expense.delete({ where: { id: expenseId } });
  revalidatePath("/dashboard/tax");
}
