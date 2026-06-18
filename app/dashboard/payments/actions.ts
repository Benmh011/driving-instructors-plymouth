"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripeConfigured } from "@/lib/stripe";
import {
  ensureConnectAccount,
  createOnboardingLink,
  expressLoginLink,
} from "@/lib/connect";

export async function startConnectOnboarding() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!stripeConfigured) redirect("/dashboard/payments");

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      stripeConnectAccountId: true,
      user: { select: { email: true } },
    },
  });
  if (!profile) redirect("/dashboard");

  const accountId = await ensureConnectAccount({
    id: profile.id,
    stripeConnectAccountId: profile.stripeConnectAccountId,
    email: profile.user.email,
  });
  const url = await createOnboardingLink(accountId);
  redirect(url);
}

export async function openExpressDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!stripeConfigured) redirect("/dashboard/payments");

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    select: { stripeConnectAccountId: true },
  });
  if (!profile?.stripeConnectAccountId) redirect("/dashboard/payments");

  const url = await expressLoginLink(profile.stripeConnectAccountId);
  redirect(url);
}
