import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "@neondatabase/serverless";
import { sendEmail } from "@/lib/email/resend";
import {
  renderPasswordResetEmail,
  renderVerifyEmail,
} from "@/emails/templates";

/**
 * Better Auth server instance.
 * User / session / account / verification tables live in Neon Postgres.
 * Transactional mail goes through Resend.
 */
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      const email = renderPasswordResetEmail(url);
      await sendEmail({
        to: user.email,
        subject: email.subject,
        html: email.html,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const email = renderVerifyEmail(url);
      await sendEmail({
        to: user.email,
        subject: email.subject,
        html: email.html,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
