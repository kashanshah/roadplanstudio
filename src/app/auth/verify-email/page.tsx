"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending, refetch } = useSession();
  const next = searchParams.get("next") || "/planner";

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [autoSent, setAutoSent] = useState(false);

  useEffect(() => {
    if (session?.user.email) setEmail(session.user.email);
  }, [session?.user.email]);

  useEffect(() => {
    if (!isPending && session?.user.emailVerified) {
      router.replace(next);
    }
  }, [isPending, session, next, router]);

  useEffect(() => {
    if (autoSent || !email || isPending) return;
    if (session && !session.user.emailVerified) {
      setAutoSent(true);
      void sendCode(true);
    }
  }, [autoSent, email, isPending, session]);

  async function sendCode(silent = false) {
    if (!email) {
      setError("Enter the email you registered with.");
      return;
    }
    setResending(true);
    setError(null);
    if (!silent) setMessage(null);
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    setResending(false);
    if (sendError) {
      setError(sendError.message || "Could not send code");
      return;
    }
    setMessage(`Code sent to ${email}. Check your inbox (and spam).`);
  }

  async function onVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    setPending(true);
    setError(null);
    const { error: verifyError } = await authClient.emailOtp.verifyEmail({
      email,
      otp: otp.trim(),
    });
    setPending(false);
    if (verifyError) {
      setError(verifyError.message || "Invalid or expired code");
      return;
    }
    await refetch?.();
    router.push(next);
    router.refresh();
  }

  if (isPending) {
    return (
      <AuthShell
        eyebrow="Verify email"
        title="Checking your session…"
        subtitle="One moment."
      >
        <p className="text-base text-muted-foreground">Loading…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Verify email"
      title="Enter the code we emailed you."
      subtitle={
        email
          ? `We sent a 6-digit code to ${email}. You can keep planning now — verification unlocks sharing.`
          : "Confirm your email with a one-time code to unlock sharing and invites."
      }
      footer={
        <Link
          href={next}
          className="text-primary underline-offset-4 hover:underline"
        >
          Skip for now — keep planning
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onVerify}>
        {!session?.user.email ? (
          <label className="block space-y-2 text-base">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="you@example.com"
            />
          </label>
        ) : null}

        <label className="block space-y-2 text-base">
          <span className="font-medium">6-digit code</span>
          <input
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="h-14 w-full rounded-2xl border border-input bg-background px-4 text-center font-display text-3xl tracking-[0.35em] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="••••••"
          />
        </label>

        {error ? (
          <p className="text-base text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-base text-primary" role="status">
            {message}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <div className="mt-5 flex flex-col gap-2 text-center text-base text-muted-foreground">
        <button
          type="button"
          onClick={() => sendCode(false)}
          disabled={resending || !email}
          className="font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
        <p>Code expires in 10 minutes.</p>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-full place-items-center p-8 text-base text-muted-foreground">
          Loading…
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
