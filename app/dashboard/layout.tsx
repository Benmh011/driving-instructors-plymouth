import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Single chokepoint for the authenticated area: an account that's scheduled for
// deletion is locked out and sent to the restore screen.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { deletionScheduledFor: true },
    });
    if (user?.deletionScheduledFor) redirect("/account/closing");
  }
  return <>{children}</>;
}
