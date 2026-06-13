import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

async function suppress(token: string | null): Promise<boolean> {
  if (!token) return false;
  const result = await prisma.prospect.updateMany({
    where: { unsubscribeToken: token },
    data: { status: "DO_NOT_CONTACT" },
  });
  return result.count > 0;
}

// One-click unsubscribe (List-Unsubscribe-Post) — mail clients POST here.
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  await suppress(token);
  return new Response(null, { status: 200 });
}

// Link in the email body — shows a confirmation page.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const ok = await suppress(token);
  const message = ok
    ? "You've been unsubscribed. You won't receive any more emails from Driving Instructors Plymouth."
    : "This unsubscribe link is no longer valid, but you've already been removed or never opted in.";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title></head><body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#c9cdca;color:#142436"><div style="max-width:480px;margin:12vh auto;padding:32px;background:#edefe8;border-radius:20px"><h1 style="font-size:22px;margin:0 0 12px">Driving Instructors Plymouth</h1><p style="font-size:16px;line-height:1.5;margin:0">${message}</p></div></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
