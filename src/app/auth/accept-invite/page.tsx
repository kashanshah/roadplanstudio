"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuthGate } from "@/components/auth/auth-gate-provider";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

type InvitePreview = {
  invite: {
    email: string;
    permission: "VIEWER" | "EDITOR";
    expiresAt: string;
  };
  trip: {
    id: string;
    title: string;
    description: string | null;
    durationDays: number;
  } | null;
};

function AcceptInviteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { data: session, isPending: sessionPending } = useSession();
  const { requireAuth } = useAuthGate();
  const returnTo = `/auth/accept-invite?token=${encodeURIComponent(token)}`;

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoadError("Missing invite token.");
      return;
    }

    let cancelled = false;
    fetch(`/api/trips/invites/${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            (data as { error?: string }).error || "Invite not found",
          );
        }
        return data as InvitePreview;
      })
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Could not load invite",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onAccept() {
    if (!token) return;
    setPending(true);
    setActionError(null);
    const res = await fetch("/api/trips/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      tripId?: string;
      error?: string;
    };
    setPending(false);
    if (!res.ok) {
      setActionError(data.error || "Could not accept invite");
      return;
    }
    router.push(`/planner/${data.tripId}`);
    router.refresh();
  }

  function openAuth(preferredTab: "login" | "register") {
    requireAuth("joinTrip", {
      returnTo,
      preferredTab,
      onAuthenticated: () => {
        router.refresh();
      },
    });
  }

  if (loadError) {
    return (
      <AuthShell
        eyebrow="Invite"
        title="This invite isn't available."
        subtitle={loadError}
        footer={
          <Link
            href="/discover"
            className="text-primary underline-offset-4 hover:underline"
          >
            Browse public trips
          </Link>
        }
      >
        <Button asChild size="lg" className="w-full">
          <Link href="/">Back home</Link>
        </Button>
      </AuthShell>
    );
  }

  if (!preview || sessionPending) {
    return (
      <AuthShell
        eyebrow="Invite"
        title="Loading invite…"
        subtitle="Hang tight while we fetch the trip details."
      >
        <p className="text-base text-muted-foreground">Please wait…</p>
      </AuthShell>
    );
  }

  const tripTitle = preview.trip?.title || "a shared trip";
  const permissionLabel =
    preview.invite.permission === "EDITOR" ? "Editor" : "Viewer";

  return (
    <AuthShell
      eyebrow="Tripmate invite"
      title={`Join ${tripTitle}.`}
      subtitle={`You've been invited as ${permissionLabel}. Accept to open the planner with your team.`}
      footer={
        <Link
          href="/discover"
          className="text-primary underline-offset-4 hover:underline"
        >
          Not for you? Browse trips instead
        </Link>
      }
    >
      <dl className="space-y-3 rounded-2xl border border-border bg-muted/40 px-5 py-4 text-base">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Trip</dt>
          <dd className="font-medium text-right">{tripTitle}</dd>
        </div>
        {preview.trip?.durationDays != null ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Days</dt>
            <dd className="font-medium">{preview.trip.durationDays}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Access</dt>
          <dd className="font-medium">{permissionLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Invited email</dt>
          <dd className="font-medium break-all text-right">
            {preview.invite.email}
          </dd>
        </div>
      </dl>

      {session ? (
        <div className="mt-6 space-y-3">
          {session.user.email?.toLowerCase() !==
          preview.invite.email.toLowerCase() ? (
            <p className="text-base text-destructive" role="alert">
              You&apos;re signed in as {session.user.email}. Sign in with{" "}
              {preview.invite.email} to accept.
            </p>
          ) : (
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={pending}
              onClick={onAccept}
            >
              {pending ? "Joining…" : "Accept invite"}
            </Button>
          )}
          {actionError ? (
            <p className="text-base text-destructive" role="alert">
              {actionError}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-base text-muted-foreground">
            Sign in with <strong>{preview.invite.email}</strong> to join this
            trip. You&apos;ll stay on this page.
          </p>
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => openAuth("login")}
          >
            Sign in to accept
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => openAuth("register")}
          >
            Create account
          </Button>
        </div>
      )}
    </AuthShell>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-full place-items-center p-8 text-base text-muted-foreground">
          Loading invite…
        </div>
      }
    >
      <AcceptInviteInner />
    </Suspense>
  );
}
