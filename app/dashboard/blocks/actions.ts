"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { blockBookingsEnabled } from "@/lib/flags";

type State = { error?: string; ok?: boolean } | undefined;

async function instructorOrNull() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
}

const blockSchema = z.object({
  name: z.string().trim().min(1, "Give the block a name.").max(60),
  hours: z.coerce.number().min(0.5, "Enter the number of hours.").max(100),
  price: z.coerce.number().min(0, "Enter a price.").max(10000),
});

export async function createBlockPackage(
  _prev: State,
  formData: FormData,
): Promise<State> {
  if (!blockBookingsEnabled()) return { error: "Block bookings aren't enabled." };
  const instructor = await instructorOrNull();
  if (!instructor) return { error: "Only instructors can do this." };

  const parsed = blockSchema.safeParse({
    name: formData.get("name"),
    hours: formData.get("hours"),
    price: formData.get("price"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the details." };
  }

  const minutes = Math.round(parsed.data.hours * 60);
  if (minutes < 30) return { error: "A block needs to be at least half an hour." };

  await prisma.blockPackage.create({
    data: {
      instructorId: instructor.id,
      name: parsed.data.name,
      minutes,
      pricePence: Math.round(parsed.data.price * 100),
    },
  });
  revalidatePath("/dashboard/blocks");
  return { ok: true };
}

export async function setBlockPackageActive(
  id: string,
  active: boolean,
): Promise<void> {
  if (!blockBookingsEnabled()) return;
  const instructor = await instructorOrNull();
  if (!instructor) return;
  await prisma.blockPackage.updateMany({
    where: { id, instructorId: instructor.id },
    data: { active },
  });
  revalidatePath("/dashboard/blocks");
}

export async function deleteBlockPackage(id: string): Promise<void> {
  if (!blockBookingsEnabled()) return;
  const instructor = await instructorOrNull();
  if (!instructor) return;
  // Deleting only removes the offering — past purchases stay in the ledger.
  await prisma.blockPackage.deleteMany({
    where: { id, instructorId: instructor.id },
  });
  revalidatePath("/dashboard/blocks");
}
