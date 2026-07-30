"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  AuthShell,
  Divider,
  SocialButtons,
} from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("fullName") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name: name || email.split("@")[0],
    });

    setPending(false);

    if (signUpError) {
      setError(signUpError.message || "Unable to create account");
      return;
    }

    router.push("/planner/new");
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
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Full name</span>
          <input
            name="fullName"
            type="text"
            autoComplete="name"
            className="h-10 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-10 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-10 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
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
