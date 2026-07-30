import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const defaultFrom =
  process.env.EMAIL_FROM || "RoadPlan Studio <onboarding@resend.dev>";

let client: Resend | null = null;

function getResend() {
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  if (!client) client = new Resend(resendApiKey);
  return client;
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
};

/**
 * Send a transactional email via Resend.
 * Falls back to console logging in development when RESEND_API_KEY is missing.
 */
export async function sendEmail(input: SendEmailInput) {
  const to = Array.isArray(input.to) ? input.to : [input.to];
  const from = input.from || defaultFrom;

  if (!resendApiKey) {
    console.info("[email:dev-fallback]", {
      from,
      to,
      subject: input.subject,
      htmlPreview: input.html.slice(0, 180),
    });
    return { id: "dev-fallback", skipped: true as const };
  }

  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  });

  if (error) {
    throw new Error(error.message || "Resend send failed");
  }

  return { id: data?.id ?? null, skipped: false as const };
}
