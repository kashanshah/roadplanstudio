"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";

type Step = "form" | "confirm-current" | "verify-new";

export function ChangeEmailForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [pendingEmail, setPendingEmail] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const newEmail = String(form.get("newEmail") || "")
      .trim()
      .toLowerCase();
    const confirmEmail = String(form.get("confirmEmail") || "")
      .trim()
      .toLowerCase();

    if (!newEmail || newEmail !== confirmEmail) {
      setPending(false);
      setError("Emails do not match");
      return;
    }
    if (newEmail === session?.user.email?.toLowerCase()) {
      setPending(false);
      setError("That’s already your current email");
      return;
    }

    const { error: changeError } = await authClient.changeEmail({
      newEmail,
      callbackURL: `${window.location.origin}/account/email?status=updated`,
    });
    setPending(false);
    if (changeError) {
      setError(changeError.message || "Could not start email change");
      return;
    }

    setPendingEmail(newEmail);
    setStep("confirm-current");
  }

  if (status === "updated") {
    return (
      <div className="max-w-md space-y-4 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-primary">
          Email updated
        </p>
        <h2 className="font-display text-2xl font-semibold">
          Your new email is confirmed.
        </h2>
        <p className="text-base text-muted-foreground">
          Use {session?.user.email} the next time you sign in.
        </p>
        <Button asChild>
          <Link href="/account">Back to account</Link>
        </Button>
      </div>
    );
  }

  if (step === "confirm-current") {
    return (
      <div className="max-w-md space-y-4 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-primary">
          Step 1 of 2
        </p>
        <h2 className="font-display text-2xl font-semibold">
          Check your current inbox
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          We sent an approval link to{" "}
          <strong className="text-foreground">{session?.user.email}</strong>.
          Open it to allow changing your email to{" "}
          <strong className="text-foreground">{pendingEmail}</strong>.
        </p>
        <p className="text-sm text-muted-foreground">
          After you approve, we&apos;ll send a second verification link to the
          new address.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStep("verify-new")}
          >
            I approved — what&apos;s next?
          </Button>
          <Button asChild variant="ghost">
            <Link href="/account">Cancel</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (step === "verify-new") {
    return (
      <div className="max-w-md space-y-4 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-primary">
          Step 2 of 2
        </p>
        <h2 className="font-display text-2xl font-semibold">
          Verify the new email
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Open the verification link we sent to{" "}
          <strong className="text-foreground">{pendingEmail}</strong>. Once
          confirmed, you&apos;ll land back here with the update complete.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            router.refresh();
            setStep("form");
          }}
        >
          Start over
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold">Change email</h2>
        <p className="mt-2 text-base text-muted-foreground">
          Current email:{" "}
          <span className="text-foreground">{session?.user.email}</span>
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          For security we email your current address first. After you approve,
          your new inbox gets a verification link.
        </p>
      </div>

      {error ? (
        <p className="text-base text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-2 text-base">
          <span className="font-medium">New email</span>
          <input
            name="newEmail"
            type="email"
            required
            autoComplete="email"
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-2 text-base">
          <span className="font-medium">Confirm new email</span>
          <input
            name="confirmEmail"
            type="email"
            required
            autoComplete="email"
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <Button type="submit" disabled={pending} className="text-base">
          {pending ? "Sending…" : "Send verification emails"}
        </Button>
      </form>
    </div>
  );
}
