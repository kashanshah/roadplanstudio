"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { tip } from "@/components/ui/app-tooltip";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useGuestTrip } from "@/lib/trips/guest-trip-provider";
import { clearGuestTrip, readGuestTrip } from "@/lib/trips/guest-trip";

export type AuthGateIntent = "save" | "share" | "invite" | "publish";

const INTENT_COPY: Record<
  AuthGateIntent,
  { title: string; body: string }
> = {
  save: {
    title: "Save your trip everywhere",
    body: "Create a free account to keep this itinerary on every device.",
  },
  share: {
    title: "Sign in to share",
    body: "Sharing and public links are available once your trip is saved to your account.",
  },
  invite: {
    title: "Invite tripmates",
    body: "Create an account to invite friends with Viewer or Editor access.",
  },
  publish: {
    title: "Publish your itinerary",
    body: "Sign in to publish a public, SEO-ready trip page.",
  },
};

type Props = {
  open: boolean;
  intent: AuthGateIntent;
  onClose: () => void;
};

export function AuthGateModal({ open, intent, onClose }: Props) {
  const router = useRouter();
  const { clearDraft } = useGuestTrip();
  const [tab, setTab] = useState<"login" | "register">("register");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setTab(intent === "save" ? "register" : "login");
    }
  }, [open, intent]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copy = INTENT_COPY[intent];

  async function claimIfNeeded() {
    const draft = readGuestTrip();
    if (!draft) return null;
    const res = await fetch("/api/trips/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || "Could not save your guest trip");
    }
    const data = (await res.json()) as { tripId: string };
    clearGuestTrip();
    clearDraft();
    return data.tripId;
  }

  async function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const { error: signInError } = await authClient.signIn.email({
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      rememberMe: form.get("rememberMe") === "on",
    });
    if (signInError) {
      setPending(false);
      setError(signInError.message || "Unable to sign in");
      return;
    }
    try {
      const tripId = await claimIfNeeded();
      onClose();
      router.push(tripId ? `/planner/${tripId}` : "/planner/new");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  async function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirmPassword") || "");
    if (password !== confirm) {
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
      email: String(form.get("email") || ""),
      password,
      name: String(form.get("fullName") || "") || "Traveler",
    });
    if (signUpError) {
      setPending(false);
      setError(signUpError.message || "Unable to create account");
      return;
    }
    try {
      const tripId = await claimIfNeeded();
      onClose();
      const email = String(form.get("email") || "");
      const nextPath = tripId ? `/planner/${tripId}` : "/planner";
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(nextPath)}`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[min(92dvh,720px)] w-full max-w-md overflow-y-auto overscroll-contain rounded-3xl border border-border bg-card p-6 shadow-elevated sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="sticky top-0 float-right z-10 -mr-1 -mt-1 grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
          {...tip("Close")}
        >
          <X className="h-5 w-5" />
        </button>

        <p className="eyebrow text-primary">Account required</p>
        <h2
          id="auth-gate-title"
          className="mt-3 font-display text-3xl font-semibold tracking-tight"
        >
          {copy.title}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {copy.body}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`rounded-full px-3 py-2.5 text-base font-medium transition ${
              tab === "login"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`rounded-full px-3 py-2.5 text-base font-medium transition ${
              tab === "register"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground"
            }`}
          >
            Create account
          </button>
        </div>

        {tab === "login" ? (
          <form className="mt-6 space-y-4" onSubmit={onLogin}>
            <label className="block space-y-2 text-base">
              <span className="font-medium">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-12 w-full rounded-full border border-input bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block space-y-2 text-base">
              <span className="font-medium">Password</span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="h-12 w-full rounded-full border border-input bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="flex items-center gap-2 text-base text-muted-foreground">
              <input name="rememberMe" type="checkbox" defaultChecked className="size-4 rounded border-input" />
              Remember me
            </label>
            {error ? (
              <p className="text-base text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in & continue"}
            </Button>
            <p className="text-center text-base text-muted-foreground">
              <Link
                href="/auth/forgot-password"
                className="text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </p>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onRegister}>
            <label className="block space-y-2 text-base">
              <span className="font-medium">Full name</span>
              <input
                name="fullName"
                type="text"
                required
                autoComplete="name"
                className="h-12 w-full rounded-full border border-input bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block space-y-2 text-base">
              <span className="font-medium">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-12 w-full rounded-full border border-input bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="h-12 w-full rounded-full border border-input bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block space-y-2 text-base">
              <span className="font-medium">Confirm password</span>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="h-12 w-full rounded-full border border-input bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="flex items-start gap-2 text-base text-muted-foreground">
              <input
                name="terms"
                type="checkbox"
                required
                className="mt-1 size-4 rounded border-input"
              />
              <span>I agree to the Terms and Privacy Policy.</span>
            </label>
            {error ? (
              <p className="text-base text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Creating…" : "Create account & continue"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
