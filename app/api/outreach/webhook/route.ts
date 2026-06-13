import crypto from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Verifies a Resend (Svix-signed) webhook. Returns false on any mismatch.
function verifySignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  signatureHeader: string,
  payload: string,
): boolean {
  if (!svixId || !svixTimestamp || !signatureHeader) return false;
  let keyBytes: Buffer;
  try {
    keyBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  } catch {
    return false;
  }
  const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
  const expected = crypto
    .createHmac("sha256", keyBytes)
    .update(signedContent)
    .digest("base64");

  // Header is a space-separated list of "v1,<base64sig>" entries.
  const provided = signatureHeader
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter((s): s is string => Boolean(s));

  const expectedBuf = Buffer.from(expected, "base64");
  return provided.some((sig) => {
    try {
      const sigBuf = Buffer.from(sig, "base64");
      return (
        sigBuf.length === expectedBuf.length &&
        crypto.timingSafeEqual(sigBuf, expectedBuf)
      );
    } catch {
      return false;
    }
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const payload = await req.text();

  if (
    !secret ||
    !verifySignature(
      secret,
      req.headers.get("svix-id") ?? "",
      req.headers.get("svix-timestamp") ?? "",
      req.headers.get("svix-signature") ?? "",
      payload,
    )
  ) {
    return new Response("invalid signature", { status: 401 });
  }

  let event: { type?: string; data?: { email_id?: string } };
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const type = event.type ?? "";
  const emailId = event.data?.email_id;
  if (!emailId) return new Response(null, { status: 200 });

  const mail = await prisma.outreachEmail.findFirst({
    where: { resendId: emailId },
    select: { id: true, prospectId: true },
  });
  if (!mail) return new Response(null, { status: 200 });

  const now = new Date();
  if (type === "email.delivered") {
    await prisma.outreachEmail.update({ where: { id: mail.id }, data: { deliveredAt: now } });
  } else if (type === "email.opened") {
    await prisma.outreachEmail.update({ where: { id: mail.id }, data: { openedAt: now } });
  } else if (type === "email.bounced") {
    await prisma.outreachEmail.update({ where: { id: mail.id }, data: { bouncedAt: now } });
    await prisma.prospect.update({
      where: { id: mail.prospectId },
      data: { status: "DO_NOT_CONTACT" },
    });
  } else if (type === "email.complained") {
    await prisma.outreachEmail.update({ where: { id: mail.id }, data: { complainedAt: now } });
    await prisma.prospect.update({
      where: { id: mail.prospectId },
      data: { status: "DO_NOT_CONTACT" },
    });
  }

  return new Response(null, { status: 200 });
}
