import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToUser, formatLessonWhen } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Fail closed: if no secret is configured, the job refuses to run.
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 401 });
  }
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when the env var is set.
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const lessons = await prisma.booking.findMany({
    where: {
      status: "BOOKED",
      reminderSentAt: null,
      start: { gte: now, lte: horizon },
    },
    include: { learner: { include: { user: true } } },
  });

  let sent = 0;
  for (const lesson of lessons) {
    await sendPushToUser(lesson.learner.userId, {
      title: "Lesson reminder",
      body: `You've got a lesson coming up — ${formatLessonWhen(lesson.start)}.`,
      url: "/diary",
      tag: `reminder-${lesson.id}`,
    });
    await prisma.booking.update({
      where: { id: lesson.id },
      data: { reminderSentAt: new Date() },
    });
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent });
}
