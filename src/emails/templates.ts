/**
 * RoadPlan Studio transactional email templates (from Lovable design lab).
 * Table-based, inline-styled HTML for Outlook / Gmail / Apple Mail.
 */

export const emailBrand = {
  spruce: "#0F2A24",
  teal: "#1A6B63",
  tealBright: "#3FA88C",
  sandstone: "#C4A882",
  snow: "#F7F5F2",
  ink: "#0B1210",
  body: "#3A4A46",
  hairline: "#E4E0D9",
};

const b = emailBrand;
const font = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'DM Sans', Helvetica, Arial, sans-serif`;
const serif = `'Fraunces', Georgia, 'Times New Roman', serif`;

function button(label: string, href: string, bg = b.teal, fg = b.snow) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;">
    <tr><td align="center" bgcolor="${bg}" style="border-radius:999px;">
      <a href="${href}" style="display:inline-block;padding:14px 30px;font-family:${font};font-size:15px;font-weight:600;color:${fg};text-decoration:none;border-radius:999px;">${label}</a>
    </td></tr>
  </table>`;
}

function shell(opts: {
  preview: string;
  eyebrow: string;
  heading: string;
  body: string;
  footerNote?: string;
}) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${opts.heading}</title></head>
<body style="margin:0;padding:0;background-color:#ffffff;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preview}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
    <tr><td align="center" style="padding:24px 12px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
        <tr><td bgcolor="${b.spruce}" style="border-radius:18px 18px 0 0;padding:26px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding-right:12px;">
              <div style="width:36px;height:36px;border-radius:11px;background-color:${b.teal};text-align:center;line-height:36px;font-family:${serif};font-size:18px;color:${b.snow};font-weight:700;">R</div>
            </td>
            <td>
              <div style="font-family:${serif};font-size:19px;font-weight:600;color:${b.snow};line-height:1.1;">RoadPlan</div>
              <div style="font-family:${font};font-size:9px;letter-spacing:3px;color:${b.sandstone};padding-top:3px;">STUDIO</div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="border:1px solid ${b.hairline};border-top:none;border-radius:0 0 18px 18px;padding:34px 28px 30px;background-color:#ffffff;">
          <div style="font-family:${font};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${b.teal};font-weight:600;">${opts.eyebrow}</div>
          <h1 style="margin:12px 0 0;font-family:${serif};font-size:27px;line-height:1.2;color:${b.spruce};font-weight:600;">${opts.heading}</h1>
          <div style="font-family:${font};font-size:15px;line-height:1.65;color:${b.body};">${opts.body}</div>
        </td></tr>
        <tr><td style="padding:22px 28px 0;text-align:center;font-family:${font};font-size:12px;line-height:1.6;color:#8A9A94;">
          ${opts.footerNote ?? "You're receiving this because you have a RoadPlan Studio account."}<br>
          RoadPlan Studio · www.roadplanstudio.com
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const infoRow = (label: string, value: string) =>
  `<tr><td style="padding:6px 0;font-family:${font};font-size:13px;color:#8A9A94;">${label}</td><td align="right" style="padding:6px 0;font-family:${font};font-size:13px;color:${b.spruce};font-weight:600;">${value}</td></tr>`;

export type RenderedEmail = {
  subject: string;
  html: string;
};

export function renderPasswordResetEmail(url: string): RenderedEmail {
  return {
    subject: "Reset your RoadPlan Studio password",
    html: shell({
      preview: "A secure link to set a new password — valid for 60 minutes.",
      eyebrow: "Account recovery",
      heading: "Set a new password.",
      body: `<p style="margin:16px 0 0;">We received a request to reset your password. Use the button below within the next 60 minutes.</p>
        ${button("Reset password", url)}
        <p style="margin:14px 0 0;font-size:13px;color:#8A9A94;">Didn't request this? Your current password still works.</p>`,
    }),
  };
}

export function renderVerifyEmail(url: string): RenderedEmail {
  return {
    subject: "Confirm your email and start planning",
    html: shell({
      preview: "One tap to confirm your email and unlock cloud sync.",
      eyebrow: "Welcome aboard",
      heading: "Let's get your first route on the map.",
      body: `<p style="margin:16px 0 0;">Thanks for joining RoadPlan Studio. Confirm your email and your trips will sync across every device.</p>
        ${button("Confirm my email", url)}
        <p style="margin:14px 0 0;font-size:13px;color:#8A9A94;">This link expires in 24 hours.</p>`,
    }),
  };
}

export function renderTripInviteEmail(opts: {
  tripTitle: string;
  acceptUrl: string;
  permission: string;
  durationDays?: number | null;
  routeSummary?: string | null;
}): RenderedEmail {
  return {
    subject: `You're invited to ${opts.tripTitle}`,
    html: shell({
      preview: `You've been invited to plan ${opts.tripTitle}.`,
      eyebrow: "Tripmate invite",
      heading: "You're on the trip.",
      body: `<p style="margin:16px 0 0;">You've been invited to co-plan <strong style="color:${b.spruce};">${opts.tripTitle}</strong>.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;border:1px solid ${b.hairline};border-radius:14px;background-color:${b.snow};">
          <tr><td style="padding:18px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${opts.routeSummary ? infoRow("Route", opts.routeSummary) : ""}
              ${opts.durationDays != null ? infoRow("Days", String(opts.durationDays)) : ""}
              ${infoRow("Access", opts.permission)}
            </table>
          </td></tr>
        </table>
        ${button("Accept invite", opts.acceptUrl, b.sandstone, b.ink)}`,
      footerNote: "You received this because someone invited you to a shared trip.",
    }),
  };
}

export function renderGuestSyncedEmail(tripUrl: string): RenderedEmail {
  return {
    subject: "Your guest trip is now saved to the cloud",
    html: shell({
      preview: "Your trip is safely saved to your account.",
      eyebrow: "Sync complete",
      heading: "Your trip made it to the cloud.",
      body: `<p style="margin:16px 0 0;">Everything you planned as a guest is now attached to your account.</p>
        ${button("Open my trip", tripUrl)}
        <p style="margin:14px 0 0;font-size:13px;color:#8A9A94;">Invite a tripmate any time from the trip menu.</p>`,
    }),
  };
}

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  description: string;
  html: string;
};

/** Static previews for /emails */
export const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome / confirm email",
    description: "Sent immediately after sign-up.",
    ...renderVerifyEmail("https://www.roadplanstudio.com/auth/callback"),
  },
  {
    id: "reset",
    name: "Password reset",
    description: "Forgot-password flow. 60-minute single-use link.",
    ...renderPasswordResetEmail(
      "https://www.roadplanstudio.com/auth/reset-password?token=preview",
    ),
  },
  {
    id: "invite",
    name: "Trip shared with tripmate",
    description: "Collaborator invite with trip summary.",
    ...renderTripInviteEmail({
      tripTitle: "Western Canada 2026",
      acceptUrl: "https://www.roadplanstudio.com/auth/accept-invite?token=preview",
      permission: "EDITOR",
      durationDays: 13,
      routeSummary: "Saskatoon → Banff → Vancouver → home",
    }),
  },
  {
    id: "sync",
    name: "Guest → cloud sync success",
    description: "Confirmation after guest itinerary migrates to an account.",
    ...renderGuestSyncedEmail("https://www.roadplanstudio.com/planner/new"),
  },
];
