"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const redirectTo = `${window.location.origin}/auth/reset-password`;

    const { error: resetError } = await authClient.requestPasswordReset({
      email,
      redirectTo,
    });

    setPending(false);
    if (resetError) {
      setError(resetError.message || "Unable to send reset email");
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password."
      subtitle="Enter your email and we'll send a secure reset link."
      footer={
        <Link
          href="/auth/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <p className="text-base leading-relaxed text-muted-foreground">
          If an account exists for that email, a reset link is on its way. Check
          your inbox and spam folder.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-2 text-base">
            <span className="font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          {error ? (
            <p className="text-base text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
