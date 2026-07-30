"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { authClient, signOut } from "@/lib/auth-client";

export function SessionsSecurityForm() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteSent, setDeleteSent] = useState(false);

  async function onLogout() {
    setSigningOut(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  async function onDelete(e: FormEvent) {
    e.preventDefault();
    if (confirmDelete !== "DELETE") {
      setError("Type DELETE to confirm account deletion");
      return;
    }
    if (!password) {
      setError("Enter your password to continue");
      return;
    }
    setDeleting(true);
    setError(null);
    const { data, error: deleteError } = await authClient.deleteUser({
      password,
      callbackURL: `${window.location.origin}/`,
    });
    setDeleting(false);
    if (deleteError) {
      setError(deleteError.message || "Could not delete account");
      return;
    }
    if (data?.message === "Verification email sent") {
      setDeleteSent(true);
      setMessage("Check your email to confirm account deletion.");
      return;
    }
    setMessage("Account deleted");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-md space-y-10">
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Log out</h2>
        <p className="text-base text-muted-foreground">
          End this browser session. Cloud-saved trips stay in your account.
        </p>
        <Button
          type="button"
          variant="secondary"
          disabled={signingOut}
          onClick={() => void onLogout()}
        >
          {signingOut ? "Signing out…" : "Log out of this device"}
        </Button>
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="font-display text-2xl font-semibold text-destructive">
          Delete account
        </h2>
        <p className="text-base text-muted-foreground">
          Permanently remove your account and owned trip data. We&apos;ll email
          you a final confirmation link before anything is deleted.
        </p>
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
        {deleteSent ? (
          <div className="rounded-2xl border border-border bg-card p-4 text-base text-muted-foreground">
            Open the deletion link in your inbox to finish. Until then, your
            account stays active.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onDelete}>
            <label className="block space-y-2 text-base">
              <span className="font-medium">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block space-y-2 text-base">
              <span className="font-medium">Type DELETE to confirm</span>
              <input
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="DELETE"
              />
            </label>
            <Button
              type="submit"
              variant="destructive"
              disabled={deleting || confirmDelete !== "DELETE"}
            >
              {deleting ? "Sending…" : "Email me a delete link"}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
