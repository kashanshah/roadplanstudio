"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function ChangePasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const currentPassword = String(form.get("currentPassword") || "");
    const newPassword = String(form.get("newPassword") || "");
    const confirm = String(form.get("confirmPassword") || "");
    const revokeOtherSessions = form.get("revokeOtherSessions") === "on";

    if (newPassword !== confirm) {
      setPending(false);
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPending(false);
      setError("Use at least 8 characters");
      return;
    }

    const { error: changeError } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions,
    });
    setPending(false);
    if (changeError) {
      setError(changeError.message || "Could not change password");
      return;
    }
    setDone(true);
    e.currentTarget.reset();
  }

  if (done) {
    return (
      <div className="max-w-md space-y-4 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-primary">
          Password updated
        </p>
        <h2 className="font-display text-2xl font-semibold">
          Your password was changed.
        </h2>
        <p className="text-base text-muted-foreground">
          Use the new password next time you sign in. If you signed out other
          devices, only this session remains.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/account">Back to account</Link>
          </Button>
          <Button type="button" variant="secondary" onClick={() => setDone(false)}>
            Change again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold">Change password</h2>
        <p className="mt-2 text-base text-muted-foreground">
          Enter your current password, then choose a new one. Forgot it?{" "}
          <Link
            href="/auth/forgot-password"
            className="text-primary underline-offset-4 hover:underline"
          >
            Reset via email
          </Link>
          .
        </p>
      </div>

      {error ? (
        <p className="text-base text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-2 text-base">
          <span className="font-medium">Current password</span>
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-2 text-base">
          <span className="font-medium">New password</span>
          <input
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-2 text-base">
          <span className="font-medium">Confirm new password</span>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input
            name="revokeOtherSessions"
            type="checkbox"
            defaultChecked
            className="mt-1 size-4 rounded border-input"
          />
          Sign out of all other devices after changing password
        </label>
        <Button type="submit" disabled={pending} className="text-base">
          {pending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
