import { NextResponse } from "next/server";

type Payload = {
  email?: string;
  role?: "learner" | "instructor";
  area?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const role = body.role === "instructor" ? "instructor" : "learner";
  const area = (body.area ?? "").trim().slice(0, 120);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  // ---------------------------------------------------------------
  // NEXT PUSH: persist + notify
  //
  // 1. Save to Neon (Pro) — e.g. with @neondatabase/serverless or Prisma:
  //
  //    import { neon } from "@neondatabase/serverless";
  //    const sql = neon(process.env.DATABASE_URL!);
  //    await sql`
  //      insert into waitlist (email, role, area)
  //      values (${email}, ${role}, ${area})
  //      on conflict (email) do update set role = excluded.role, area = excluded.area
  //    `;
  //
  // 2. Send a confirmation via Resend:
  //
  //    import { Resend } from "resend";
  //    const resend = new Resend(process.env.RESEND_API_KEY!);
  //    await resend.emails.send({
  //      from: process.env.WAITLIST_FROM_EMAIL!,
  //      to: email,
  //      subject: "You're on the Clutch waitlist",
  //      text: "Thanks for joining — we'll be in touch when we launch near you.",
  //    });
  // ---------------------------------------------------------------

  // For the first push we just log and acknowledge so the form is testable.
  console.log("[waitlist]", { email, role, area, at: new Date().toISOString() });

  return NextResponse.json({ ok: true, role });
}
