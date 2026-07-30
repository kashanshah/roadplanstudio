"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  AuthShell,
  Divider,
  SocialButtons,
} from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/planner/new";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    setPending(false);

    if (signInError) {
      setError(signInError.message || "Unable to sign in");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Pick up where the road left off."
      subtitle="Sign in to sync your itineraries across every device you plan on."
    >
      <SocialButtons />
      <Divider />
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-10 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Password</span>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-10 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href="/auth/register"
          className="text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
