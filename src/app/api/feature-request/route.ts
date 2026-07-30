import { z } from "zod";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  title: z.string().trim().min(3).max(120),
  category: z.enum([
    "planner",
    "templates",
    "collaboration",
    "mobile",
    "i18n",
    "other",
  ]),
  details: z.string().trim().min(10).max(5000),
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

  const { name, email, title, category, details } = parsed.data;
  const to =
    process.env.FEATURE_REQUEST_EMAIL ||
    process.env.CONTACT_EMAIL ||
    process.env.EMAIL_FROM ||
    "hello@roadplanstudio.com";

  try {
    await sendEmail({
      to,
      replyTo: email,
      subject: `[Feature · ${category}] ${title}`,
      text: `From: ${name} <${email}>\nCategory: ${category}\nTitle: ${title}\n\n${details}`,
      html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
<p><strong>Category:</strong> ${escapeHtml(category)}</p>
<p><strong>Title:</strong> ${escapeHtml(title)}</p>
<p>${escapeHtml(details).replace(/\n/g, "<br/>")}</p>`,
    });
  } catch (err) {
    console.error("[feature-request]", err);
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
