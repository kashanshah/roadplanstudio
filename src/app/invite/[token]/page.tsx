"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuthGate } from "@/components/auth/auth-gate-provider";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

type InviteDay = {
  dayIndex: number;
  title: string;
  isRestDay: boolean;
  routeSummary: string | null;
  items: Array<{
    name: string;
    type: string;
    address: string | null;
    notes: string | null;
  }>;
};

type LinkPreview = {
  link: {
    permission: "VIEWER" | "EDITOR";
    requireApproval: boolean;
  };
  trip: {
    id: string;
    title: string;
    visibility: "private" | "unlisted" | "public";
    description?: string | null;
    durationDays?: number;
    coverPhotoUrl?: string | null;
    slug?: string | null;
    difficulty?: string;
  };
  canViewItinerary: boolean;
  days?: InviteDay[];
  membership: {
    isOwner: boolean;
    isCollaborator: boolean;
    permission: "VIEWER" | "EDITOR" | null;
    pendingRequest: boolean;
  } | null;
};

function stopTypeLabel(type: string) {
  if (type === "hotel") return "lodging";
  if (type === "custom") return "custom";
  return "stop";
}

function InviteLinkInner() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token || "";
  const { data: session, isPending: sessionPending } = useSession();
  const { requireAuth } = useAuthGate();
  const returnTo = `/invite/${token}`;

  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    fetch(`/api/trips/invite-links/${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            (data as { error?: string }).error || "Invite link not found",
          );
        }
        return data as LinkPreview;
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

  const resolvedLoadError = !token ? "Missing invite token." : loadError;

  async function onJoin() {
    if (!token) return;
    setPending(true);
    setActionError(null);
    const res = await fetch(
      `/api/trips/invite-links/${encodeURIComponent(token)}/join`,
      { method: "POST" },
    );
    const data = (await res.json().catch(() => ({}))) as {
      tripId?: string;
      status?: string;
      error?: string;
    };
    setPending(false);
    if (!res.ok) {
      setActionError(data.error || "Could not join trip");
      return;
    }

    if (data.status === "pending") {
      setStatusMessage(
        "Request sent. The trip owner will need to approve before you can join.",
      );
      setPreview((prev) =>
        prev
          ? {
              ...prev,
              membership: {
                isOwner: false,
                isCollaborator: false,
                permission: null,
                pendingRequest: true,
              },
            }
          : prev,
      );
      return;
    }

    if (data.tripId) {
      router.push(`/planner/${data.tripId}`);
      router.refresh();
    }
  }

  async function onDecline() {
    if (!token) return;
    setPending(true);
    setActionError(null);
    if (session) {
      await fetch(
        `/api/trips/invite-links/${encodeURIComponent(token)}/decline`,
        { method: "POST" },
      );
    }
    setPending(false);
    router.push("/discover");
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

  if (resolvedLoadError) {
    return (
      <AuthShell
        eyebrow="Invite"
        title="This invite isn't available."
        subtitle={resolvedLoadError}
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
        subtitle="Hang tight while we fetch the invitation."
      >
        <p className="text-base text-muted-foreground">Please wait…</p>
      </AuthShell>
    );
  }

  const tripTitle = preview.trip.title || "a shared trip";
  const permissionLabel =
    preview.link.permission === "EDITOR" ? "Editor" : "Viewer";
  const isPrivate = preview.trip.visibility === "private";
  const isPublic = preview.trip.visibility === "public";
  const days = preview.days ?? [];
  const showItinerary = isPublic && days.length > 0;
  const membership = preview.membership;
  const alreadyMember =
    membership?.isOwner || membership?.isCollaborator || false;
  const pendingRequest = membership?.pendingRequest || !!statusMessage;

  const publicTripHref =
    preview.canViewItinerary && preview.trip.slug
      ? `/trips/${preview.trip.slug}`
      : preview.canViewItinerary
        ? `/planner/${preview.trip.id}`
        : null;

  return (
    <AuthShell
      wide={showItinerary}
      eyebrow="Tripmate invite"
      title={`Join ${tripTitle}.`}
      subtitle={
        isPrivate
          ? `You've been invited as ${permissionLabel}. Accept to join — the itinerary stays private until you're a tripmate.`
          : isPublic
            ? `You've been invited as ${permissionLabel}. Preview the full public itinerary below, then join to plan with the team.`
            : preview.link.requireApproval
              ? `Request ${permissionLabel.toLowerCase()} access. The owner will approve before you can edit or view as a tripmate.`
              : `Join as ${permissionLabel} and open the planner with your team.`
      }
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
          <dd className="text-right font-medium">{tripTitle}</dd>
        </div>
        {preview.canViewItinerary && preview.trip.durationDays != null ? (
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
          <dt className="text-muted-foreground">Join mode</dt>
          <dd className="font-medium">
            {preview.link.requireApproval ? "Needs approval" : "Instant join"}
          </dd>
        </div>
        {isPrivate ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Visibility</dt>
            <dd className="font-medium">Private</dd>
          </div>
        ) : null}
        {isPublic ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Visibility</dt>
            <dd className="font-medium">Public</dd>
          </div>
        ) : null}
        {preview.canViewItinerary && preview.trip.description ? (
          <div className="border-t border-border pt-3">
            <dt className="text-muted-foreground">About</dt>
            <dd className="mt-1 text-sm leading-relaxed text-foreground">
              {preview.trip.description}
            </dd>
          </div>
        ) : null}
      </dl>

      {isPrivate ? (
        <p className="mt-4 text-sm text-muted-foreground">
          This trip is private. You can accept or decline the invite here — the
          full itinerary is only visible after you join.
        </p>
      ) : null}

      {publicTripHref && !showItinerary ? (
        <Button asChild size="lg" variant="secondary" className="mt-4 w-full">
          <Link href={publicTripHref}>View trip</Link>
        </Button>
      ) : null}

      {statusMessage ? (
        <p className="mt-4 text-base text-primary" role="status">
          {statusMessage}
        </p>
      ) : null}

      {alreadyMember ? (
        <div className="mt-6 space-y-3">
          <p className="text-base text-muted-foreground">
            You&apos;re already on this trip.
          </p>
          <Button asChild size="lg" className="w-full">
            <Link href={`/planner/${preview.trip.id}`}>Open planner</Link>
          </Button>
        </div>
      ) : pendingRequest && session ? (
        <div className="mt-6 space-y-3">
          <p className="text-base text-muted-foreground">
            Your request is waiting for the owner&apos;s approval.
          </p>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full"
            disabled={pending}
            onClick={onDecline}
          >
            {pending ? "Canceling…" : "Cancel request"}
          </Button>
        </div>
      ) : session ? (
        <div className="mt-6 space-y-3">
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={pending}
            onClick={onJoin}
          >
            {pending
              ? preview.link.requireApproval
                ? "Requesting…"
                : "Joining…"
              : preview.link.requireApproval
                ? "Request to join"
                : "Accept invite"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full"
            disabled={pending}
            onClick={onDecline}
          >
            Decline
          </Button>
          {actionError ? (
            <p className="text-base text-destructive" role="alert">
              {actionError}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-base text-muted-foreground">
            Sign in or create an account to{" "}
            {preview.link.requireApproval ? "request access" : "join this trip"}
            . You&apos;ll stay on this page.
          </p>
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => openAuth("login")}
          >
            Sign in
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
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full"
            disabled={pending}
            onClick={onDecline}
          >
            Decline
          </Button>
        </div>
      )}

      {showItinerary ? (
        <section className="mt-10 border-t border-border pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow text-primary">Itinerary</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                Day by day
              </h2>
            </div>
            {publicTripHref ? (
              <Link
                href={publicTripHref}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Open public page
              </Link>
            ) : null}
          </div>
          <ol className="mt-6 space-y-6">
            {days.map((day) => (
              <li key={`${day.dayIndex}-${day.title}`} className="border-t border-border pt-5">
                <p className="text-sm uppercase tracking-widest text-muted-foreground">
                  Day {day.dayIndex}
                  {day.isRestDay ? " · Rest day" : ""}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{day.title}</h3>
                {day.routeSummary ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {day.routeSummary}
                  </p>
                ) : null}
                {day.items.length ? (
                  <ul className="mt-3 space-y-2">
                    {day.items.map((stop, index) => (
                      <li
                        key={`${day.dayIndex}-${index}-${stop.name}`}
                        className="text-sm leading-snug"
                      >
                        <span className="font-medium text-foreground">
                          {stop.name}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {stopTypeLabel(stop.type)}
                        </span>
                        {stop.address ? (
                          <span className="mt-0.5 block text-muted-foreground">
                            {stop.address}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No stops yet.
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </AuthShell>
  );
}

export default function InviteLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-full place-items-center p-8 text-base text-muted-foreground">
          Loading invite…
        </div>
      }
    >
      <InviteLinkInner />
    </Suspense>
  );
}
