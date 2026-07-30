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
import { isInviteReturnPath, safeNextPath } from "@/lib/auth/safe-next";
import { authClient } from "@/lib/auth-client";
import { clearGuestTrip, readGuestTrip } from "@/lib/trips/guest-trip";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"), "/planner/new");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function claimIfNeeded() {
    if (isInviteReturnPath(next)) return null;
    const draft = readGuestTrip();
    if (!draft) return null;
    const res = await fetch("/api/trips/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { tripId: string };
    clearGuestTrip();
    return data.tripId;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const rememberMe = form.get("rememberMe") === "on";

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
    });

    if (signInError) {
      setPending(false);
      setError(signInError.message || "Unable to sign in");
      return;
    }

    const tripId = await claimIfNeeded();
    setPending(false);
    router.push(isInviteReturnPath(next) ? next : tripId ? `/planner/${tripId}` : next);
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
        <label className="block space-y-2 text-base">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-2 text-base">
          <div className="flex items-center justify-between">
            <span className="font-medium">Password</span>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary underline-offset-4 hover:underline"
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
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="flex items-center gap-2 text-base text-muted-foreground">
          <input
            name="rememberMe"
            type="checkbox"
            defaultChecked
            className="size-4 rounded border-input"
          />
          Remember me
        </label>
        {error ? (
          <p className="text-base text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-base text-muted-foreground">
        New here?{" "}
        <Link
          href={`/auth/register?next=${encodeURIComponent(next)}`}
          className="text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
