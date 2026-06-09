import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { authorizeConversation } from "@/lib/chat";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const instructorId = searchParams.get("instructorId") ?? "";
  const learnerId = searchParams.get("learnerId") ?? "";
  const after = searchParams.get("after");

  const party = await authorizeConversation(session.user.id, instructorId, learnerId);
  if (!party) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: {
      instructorId,
      learnerId,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, senderId: true, body: true, createdAt: true },
  });

  return NextResponse.json({
    meId: party.meId,
    messages: messages.map((m: { id: string; senderId: string; body: string; createdAt: Date }) => ({
      id: m.id,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
