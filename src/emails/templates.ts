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

export function renderChangeEmailConfirmEmail(opts: {
  url: string;
  newEmail: string;
}): RenderedEmail {
  return {
    subject: "Approve your email change",
    html: shell({
      preview: `Confirm you want to change your RoadPlan email to ${opts.newEmail}.`,
      eyebrow: "Security check",
      heading: "Approve this email change?",
      body: `<p style="margin:16px 0 0;">Someone requested changing your RoadPlan Studio email to <strong style="color:${b.spruce};">${opts.newEmail}</strong>.</p>
        <p style="margin:12px 0 0;">If that was you, approve the change below. We'll then send a verification link to the new address.</p>
        ${button("Approve email change", opts.url)}
        <p style="margin:14px 0 0;font-size:13px;color:#8A9A94;">Didn't request this? Ignore the email — your address stays the same.</p>`,
    }),
  };
}

export function renderChangeEmailVerifyEmail(opts: {
  url: string;
}): RenderedEmail {
  return {
    subject: "Verify your new RoadPlan email",
    html: shell({
      preview: "Confirm your new email to finish updating your account.",
      eyebrow: "Email change",
      heading: "Verify your new email.",
      body: `<p style="margin:16px 0 0;">You're almost done. Confirm this inbox to finish updating the email on your RoadPlan Studio account.</p>
        ${button("Verify new email", opts.url)}
        <p style="margin:14px 0 0;font-size:13px;color:#8A9A94;">This link expires soon. If you didn't request a change, you can ignore this message.</p>`,
    }),
  };
}

export function renderDeleteAccountEmail(opts: { url: string }): RenderedEmail {
  return {
    subject: "Confirm account deletion",
    html: shell({
      preview: "Confirm if you want to permanently delete your RoadPlan account.",
      eyebrow: "Danger zone",
      heading: "Delete your account?",
      body: `<p style="margin:16px 0 0;">This permanently removes your RoadPlan Studio account and owned trips. Click below only if you meant to delete everything.</p>
        ${button("Yes, delete my account", opts.url, "#B4533A")}
        <p style="margin:14px 0 0;font-size:13px;color:#8A9A94;">If you didn't request this, ignore the email — your account stays intact.</p>`,
    }),
  };
}

export function renderOtpEmail(opts: {
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}): RenderedEmail {
  const headings: Record<typeof opts.type, { subject: string; heading: string; body: string }> = {
    "email-verification": {
      subject: "Your RoadPlan verification code",
      heading: "Confirm it's you.",
      body: "Enter this code in RoadPlan Studio to verify your email and unlock sharing.",
    },
    "sign-in": {
      subject: "Your RoadPlan sign-in code",
      heading: "Your sign-in code.",
      body: "Use this one-time code to sign in to RoadPlan Studio.",
    },
    "forget-password": {
      subject: "Your RoadPlan password reset code",
      heading: "Reset your password.",
      body: "Use this code to choose a new password.",
    },
    "change-email": {
      subject: "Confirm your new email",
      heading: "Confirm your new email.",
      body: "Use this code to finish changing your email address.",
    },
  };
  const copy = headings[opts.type];

  return {
    subject: copy.subject,
    html: shell({
      preview: `Your code is ${opts.otp}. It expires in 10 minutes.`,
      eyebrow: "Verification code",
      heading: copy.heading,
      body: `<p style="margin:16px 0 0;">${copy.body}</p>
        <div style="margin:28px 0;padding:22px;border-radius:16px;background-color:${b.snow};border:1px solid ${b.hairline};text-align:center;">
          <div style="font-family:${serif};font-size:36px;letter-spacing:0.28em;font-weight:600;color:${b.spruce};">${opts.otp}</div>
          <p style="margin:12px 0 0;font-family:${font};font-size:13px;color:#8A9A94;">Expires in 10 minutes</p>
        </div>
        <p style="margin:0;font-size:13px;color:#8A9A94;">Didn't request this? You can ignore the email.</p>`,
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
    id: "otp",
    name: "Email verification OTP",
    description: "6-digit code sent on sign-up and resend.",
    ...renderOtpEmail({ otp: "482913", type: "email-verification" }),
  },
  {
    id: "welcome",
    name: "Welcome / confirm email (link)",
    description: "Legacy magic-link style confirmation.",
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
    id: "change-email-confirm",
    name: "Approve email change",
    description: "Sent to the current inbox before switching emails.",
    ...renderChangeEmailConfirmEmail({
      url: "https://www.roadplanstudio.com/api/auth/verify-email?token=preview",
      newEmail: "new@example.com",
    }),
  },
  {
    id: "change-email-verify",
    name: "Verify new email",
    description: "Sent to the new inbox to finish the change.",
    ...renderChangeEmailVerifyEmail({
      url: "https://www.roadplanstudio.com/api/auth/verify-email?token=preview",
    }),
  },
  {
    id: "delete-account",
    name: "Delete account confirmation",
    description: "Final confirmation before account deletion.",
    ...renderDeleteAccountEmail({
      url: "https://www.roadplanstudio.com/api/auth/delete-user/callback?token=preview",
    }),
  },
  {
    id: "sync",
    name: "Guest → cloud sync success",
    description: "Confirmation after guest itinerary migrates to an account.",
    ...renderGuestSyncedEmail("https://www.roadplanstudio.com/planner/new"),
  },
];
