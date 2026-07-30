import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "@neondatabase/serverless";
import { sendEmail } from "@/lib/email/resend";
import {
  renderChangeEmailConfirmEmail,
  renderChangeEmailVerifyEmail,
  renderDeleteAccountEmail,
  renderOtpEmail,
  renderPasswordResetEmail,
} from "@/emails/templates";

/**
 * Better Auth server instance.
 * User / session / account / verification tables live in Neon Postgres.
 * Transactional mail goes through Resend (OTP verification + password reset).
 */
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Soft gate in the UI; users can plan before verifying.
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
    sendOnSignUp: false,
    // Signup uses emailOTP; this path covers change-email link verification.
    sendVerificationEmail: async ({ user, url }) => {
      const rendered = renderChangeEmailVerifyEmail({ url });
      void sendEmail({
        to: user.email,
        subject: rendered.subject,
        html: rendered.html,
      }).catch((err) =>
        console.error("[emailVerification] send failed", err),
      );
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        const rendered = renderChangeEmailConfirmEmail({ url, newEmail });
        void sendEmail({
          to: user.email,
          subject: rendered.subject,
          html: rendered.html,
        }).catch((err) =>
          console.error("[changeEmail] confirmation send failed", err),
        );
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        const rendered = renderDeleteAccountEmail({ url });
        void sendEmail({
          to: user.email,
          subject: rendered.subject,
          html: rendered.html,
        }).catch((err) =>
          console.error("[deleteUser] verification send failed", err),
        );
      },
    },
  },
  plugins: [
    nextCookies(),
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 10,
      allowedAttempts: 5,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      storeOTP: "hashed",
      sendVerificationOTP: async ({ email, otp, type }) => {
        const rendered = renderOtpEmail({ otp, type });
        void sendEmail({
          to: email,
          subject: rendered.subject,
          html: rendered.html,
        }).catch((err) => console.error("[emailOTP] send failed", err));
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
