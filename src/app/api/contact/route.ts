import { z } from "zod";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  topic: z.enum(["general", "support", "press", "partnership", "other"]),
  message: z.string().trim().min(10).max(5000),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form fields and try again." },
      { status: 400 },
    );
  }

  const { name, email, topic, message } = parsed.data;
  const to = process.env.CONTACT_EMAIL || process.env.EMAIL_FROM || "hello@roadplanstudio.com";

  try {
    await sendEmail({
      to,
      replyTo: email,
      subject: `[Contact · ${topic}] ${name}`,
      text: `From: ${name} <${email}>\nTopic: ${topic}\n\n${message}`,
      html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
<p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
<p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
    });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json(
      { error: "Could not send right now. Try again shortly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
