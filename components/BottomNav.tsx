import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BottomNavBar from "./BottomNavBar";

// Self-gating bottom navigation: renders nothing unless the visitor is a
// signed-in, onboarded user. Drop <BottomNav /> into any app page.
export default async function BottomNav() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, onboardingComplete: true },
  });
  if (!user || !user.onboardingComplete) return null;

  return <BottomNavBar role={user.role} />;
}
