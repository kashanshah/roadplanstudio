"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  AuthShell,
  Divider,
  SocialButtons,
} from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { clearGuestTrip, readGuestTrip } from "@/lib/trips/guest-trip";

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

const STRENGTH_LABEL = ["Too short", "Weak", "Okay", "Good", "Strong"];

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");
  const strength = useMemo(() => passwordStrength(password), [password]);

  async function claimIfNeeded() {
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
    const name = String(form.get("fullName") || "");
    const email = String(form.get("email") || "");
    const pwd = String(form.get("password") || "");
    const confirm = String(form.get("confirmPassword") || "");

    if (pwd !== confirm) {
      setPending(false);
      setError("Passwords do not match");
      return;
    }
    if (!form.get("terms")) {
      setPending(false);
      setError("Please accept the terms to continue");
      return;
    }

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password: pwd,
      name: name || email.split("@")[0],
    });

    if (signUpError) {
      setPending(false);
      setError(signUpError.message || "Unable to create account");
      return;
    }

    const tripId = await claimIfNeeded();
    setPending(false);

    const verifyUrl = `/auth/verify-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(
      next || (tripId ? `/planner/${tripId}` : "/planner"),
    )}`;
    router.push(verifyUrl);
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow="Join the studio"
      title="Create your account."
      subtitle="Save guest trips to the cloud and unlock sharing with tripmates."
    >
      <SocialButtons />
      <Divider />
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-2 text-base">
          <span className="font-medium">Full name</span>
          <input
            name="fullName"
            type="text"
            required
            autoComplete="name"
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
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
        <label className="block space-y-2 text-base">
          <span className="font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="mt-2">
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < strength ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {STRENGTH_LABEL[strength]}
            </p>
          </div>
        </label>
        <label className="block space-y-2 text-base">
          <span className="font-medium">Confirm password</span>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="flex items-start gap-2 text-base text-muted-foreground">
          <input
            name="terms"
            type="checkbox"
            required
            className="mt-1 size-4 rounded border-input"
          />
          <span>
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {error ? (
          <p className="text-base text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-base text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
