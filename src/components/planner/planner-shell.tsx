"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Share2,
  Users,
  Save,
  Lock,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { AccountMenu } from "@/components/auth/account-menu";
import { VerifyEmailBanner } from "@/components/auth/verify-email-banner";
import { useAuthGate } from "@/components/auth/auth-gate-provider";
import { GuestBanner } from "@/components/layout/guest-banner";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ItineraryCanvas } from "@/components/planner/itinerary-canvas";
import { PlannerEmptyState } from "@/components/planner/planner-empty-state";
import type { MapStop } from "@/components/planner/trip-map";
import type {
  PlaceDetailsPayload,
  PlannerAccommodation,
  PlannerDay,
  PlannerItem,
  StopStatus,
} from "@/components/planner/planner-types";
import { Button } from "@/components/ui/button";
import { ShareSheet } from "@/components/trips/share-sheet";
import { TripmatesPanel } from "@/components/trips/tripmates-panel";
import { useSession } from "@/lib/auth-client";
import { useGuestTrip } from "@/lib/trips/guest-trip-provider";
import type { GuestStopStatus } from "@/lib/trips/guest-trip";

const TripMap = dynamic(
  () =>
    import("@/components/planner/trip-map").then((m) => m.TripMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid min-h-[420px] place-items-center rounded-2xl border border-border bg-muted/40 sm:min-h-[520px]">
        <p className="text-base text-muted-foreground">Loading map…</p>
      </div>
    ),
  },
);

type CloudTripPayload = {
  trip: {
    id: string;
    title: string;
    description: string | null;
    durationDays: number;
    visibility: string;
    ownerId: string;
  };
  access: {
    isOwner: boolean;
    isEditor: boolean;
    permission: string | null;
  };
  days: PlannerDay[];
  accommodations: PlannerAccommodation[];
};

type Props = {
  tripId: string;
};

function normalizeStatus(status: string | null | undefined): StopStatus {
  if (
    status === "visited" ||
    status === "skipped" ||
    status === "cancelled" ||
    status === "favorite"
  ) {
    return status;
  }
  return "to_visit";
}

export function PlannerShell({ tripId }: Props) {
  const router = useRouter();
  const isDraftRoute = tripId === "new";
  const { data: session, isPending: sessionPending } = useSession();
  const isLoggedIn = !!session;
  const isVerified = !!session?.user.emailVerified;
  const isAnonymous = isDraftRoute && !isLoggedIn;
  const { requireAuth } = useAuthGate();
  const { draft, hydrated, clearDraft, updateDraft } = useGuestTrip();
  const [shareOpen, setShareOpen] = useState(false);
  const [matesOpen, setMatesOpen] = useState(false);
  const [cloud, setCloud] = useState<CloudTripPayload | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [loadingCloud, setLoadingCloud] = useState(!isDraftRoute);
  const [saving, setSaving] = useState(false);
  const [focusStopId, setFocusStopId] = useState<string | null>(null);

  useEffect(() => {
    if (isDraftRoute) {
      setLoadingCloud(false);
      return;
    }

    let cancelled = false;
    setLoadingCloud(true);
    setCloudError(null);

    fetch(`/api/trips/${tripId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error || "Trip not found");
        }
        return res.json() as Promise<CloudTripPayload>;
      })
      .then((data) => {
        if (cancelled) return;
        setCloud({
          ...data,
          days: (data.days ?? []).map((d) => ({
            ...d,
            items: (d.items ?? []).map((i) => ({
              ...i,
              status: normalizeStatus(i.status),
              googlePlaceId: i.googlePlaceId ?? null,
              googleMapsUri: i.googleMapsUri ?? null,
              durationMins: i.durationMins ?? null,
              latitude: i.latitude ?? null,
              longitude: i.longitude ?? null,
            })),
          })),
          accommodations: data.accommodations ?? [],
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setCloud(null);
          setCloudError(
            err instanceof Error ? err.message : "Could not load trip",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCloud(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tripId, isDraftRoute]);

  const title = isDraftRoute
    ? draft?.title || "Untitled road trip"
    : cloud?.trip.title || `Trip ${tripId.slice(0, 8)}`;

  const isOwner = !!cloud?.access.isOwner;
  const isEditor = isDraftRoute ? true : !!cloud?.access.isEditor;
  const canManage = isOwner;

  const roleLabel = isDraftRoute
    ? isLoggedIn
      ? "Unsaved draft · save to sync across devices"
      : "Guest draft · local to this browser"
    : loadingCloud
      ? "Loading…"
      : isOwner
        ? "You own this trip"
        : isEditor
          ? "Editor access"
          : cloud
            ? "Viewer access"
            : "Cloud trip";

  const days: PlannerDay[] = useMemo(() => {
    if (isDraftRoute) {
      return (draft?.days ?? []).map((d) => ({
        id: d.id,
        dayIndex: d.dayIndex,
        title: d.title,
        date: d.date ?? null,
        routeSummary: d.routeSummary ?? null,
        notes: d.notes ?? null,
        items: d.items.map((i) => ({
          id: i.id,
          name: i.name,
          address: i.address ?? null,
          type: i.type,
          notes: i.notes ?? null,
          sortOrder: i.sortOrder,
          latitude: i.latitude ?? null,
          longitude: i.longitude ?? null,
          googlePlaceId: i.googlePlaceId ?? null,
          googleMapsUri: null,
          durationMins: i.durationMins ?? null,
          status: normalizeStatus(i.status),
        })),
      }));
    }
    return cloud?.days ?? [];
  }, [isDraftRoute, draft, cloud]);

  const accommodations = cloud?.accommodations ?? [];
  const hasTimelineContent = days.some((d) => d.items.length > 0);
  const showEmptyState = isDraftRoute && !hasTimelineContent;

  const mapStops = useMemo((): MapStop[] => {
    return days.flatMap((d) =>
      d.items
        .filter((i) => i.latitude != null && i.longitude != null)
        .map((i) => ({
          id: i.id,
          name: i.name,
          latitude: i.latitude as number,
          longitude: i.longitude as number,
          type: i.type,
          dayIndex: d.dayIndex,
          status: i.status,
        })),
    );
  }, [days]);

  async function claimDraft() {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch("/api/trips/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { tripId: string };
      clearDraft();
      window.location.href = `/planner/${data.tripId}`;
    } finally {
      setSaving(false);
    }
  }

  async function onSave() {
    if (!isLoggedIn) {
      requireAuth("save");
      return;
    }
    if (isDraftRoute && draft) {
      await claimDraft();
    }
  }

  function requireVerified(intent: "share" | "invite") {
    if (!isLoggedIn) {
      requireAuth(intent);
      return false;
    }
    if (!isVerified) {
      const next = encodeURIComponent(
        isDraftRoute ? "/planner/new" : `/planner/${tripId}`,
      );
      const email = encodeURIComponent(session?.user.email || "");
      router.push(`/auth/verify-email?email=${email}&next=${next}`);
      return false;
    }
    return true;
  }

  function onShare() {
    if (isDraftRoute) {
      if (!isLoggedIn) {
        requireAuth("share");
        return;
      }
      void claimDraft();
      return;
    }
    if (!requireVerified("share")) return;
    if (!canManage) return;
    setShareOpen(true);
  }

  function onTripmates() {
    if (isDraftRoute) {
      if (!isLoggedIn) {
        requireAuth("invite");
        return;
      }
      void claimDraft();
      return;
    }
    if (!requireVerified("invite")) return;
    if (!canManage) return;
    setMatesOpen(true);
  }

  async function updateItem(
    itemId: string,
    patch: Partial<Pick<PlannerItem, "status" | "durationMins" | "notes">>,
  ) {
    if (!isEditor) return;

    if (isDraftRoute) {
      updateDraft((current) => ({
        ...current,
        days: current.days.map((day) => ({
          ...day,
          items: day.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  ...patch,
                  status: (patch.status ?? item.status) as GuestStopStatus,
                }
              : item,
          ),
        })),
      }));
      return;
    }

    setCloud((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((day) => ({
          ...day,
          items: day.items.map((item) =>
            item.id === itemId ? { ...item, ...patch } : item,
          ),
        })),
      };
    });

    const res = await fetch(`/api/trips/${tripId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      // Soft fail — UI already optimistic; refetch would be ideal later.
      console.error("Failed to update item");
    }
  }

  async function addPlace(
    dayId: string,
    place: PlaceDetailsPayload,
    asHotel: boolean,
  ) {
    if (!isEditor) return;
    const type = asHotel ? "hotel" : "attraction";

    if (isDraftRoute) {
      updateDraft((current) => ({
        ...current,
        days: current.days.map((day) => {
          if (day.id !== dayId) return day;
          const sortOrder = day.items.length;
          return {
            ...day,
            items: [
              ...day.items,
              {
                id: crypto.randomUUID(),
                sortOrder,
                type,
                name: place.name,
                address: place.formattedAddress,
                latitude: place.latitude,
                longitude: place.longitude,
                googlePlaceId: place.placeId,
                durationMins: place.estimatedDurationMins || null,
                status: "to_visit" as const,
                notes: null,
              },
            ],
          };
        }),
      }));
      return;
    }

    if (!isLoggedIn) {
      requireAuth("save");
      return;
    }

    const res = await fetch(`/api/trips/${tripId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayId,
        googlePlaceId: place.placeId,
        type,
        durationMins: place.estimatedDurationMins,
      }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { item: PlannerItem };
    setCloud((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((day) =>
          day.id === dayId
            ? {
                ...day,
                items: [
                  ...day.items,
                  {
                    ...data.item,
                    status: normalizeStatus(data.item.status),
                  },
                ],
              }
            : day,
        ),
      };
    });
  }

  return (
    <div className="flex min-h-full flex-col bg-background text-[17px]">
      {isAnonymous ? <GuestBanner /> : null}
      {!isAnonymous ? <VerifyEmailBanner /> : null}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" aria-label="RoadPlan Studio home">
              <LogoMark className="h-9 w-9" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-base font-medium text-foreground sm:text-lg">
                {title}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                {!isDraftRoute && cloud && !isEditor ? (
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                ) : null}
                {roleLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDraftRoute ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hidden text-base sm:inline-flex"
                onClick={onSave}
                disabled={saving || (isLoggedIn && !draft)}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : isLoggedIn ? "Save trip" : "Save"}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-base"
              onClick={onShare}
              disabled={!isDraftRoute && !!cloud && !canManage}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-base"
              onClick={onTripmates}
              disabled={!isDraftRoute && !!cloud && !canManage}
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Tripmates</span>
            </Button>
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
                Itinerary
              </p>
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">
                Timeline
              </h1>
            </div>
            {isDraftRoute && isLoggedIn && hasTimelineContent ? (
              <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={saving || !draft}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save to account"}
              </Button>
            ) : null}
            {isAnonymous && hasTimelineContent ? (
              <Button
                type="button"
                size="sm"
                onClick={() => requireAuth("save")}
              >
                Create account to save
              </Button>
            ) : null}
          </div>

          {loadingCloud || (isDraftRoute && !hydrated) || sessionPending ? (
            <p className="text-base text-muted-foreground">
              Loading itinerary…
            </p>
          ) : cloudError ? (
            <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
              <p className="text-base text-destructive">{cloudError}</p>
              <Button asChild variant="secondary">
                <Link href="/discover">Browse public trips</Link>
              </Button>
            </div>
          ) : showEmptyState ? (
            <div className="space-y-5">
              <PlannerEmptyState
                isLoggedIn={isLoggedIn}
                hasDraft={!!draft}
                onSaveDraft={isLoggedIn ? onSave : undefined}
                saving={saving}
              />
            </div>
          ) : (
            <>
              {cloud?.trip.description ||
              (isDraftRoute &&
                (draft?.startLocation || draft?.endLocation)) ? (
                <p className="mb-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {isDraftRoute &&
                  (draft?.startLocation || draft?.endLocation)
                    ? `Route sketch: ${[draft?.startLocation, draft?.endLocation].filter(Boolean).join(" → ")}.`
                    : cloud?.trip.description}
                </p>
              ) : null}
              {!isDraftRoute && cloud && !isEditor ? (
                <p className="mb-4 rounded-2xl bg-secondary px-4 py-3 text-base text-muted-foreground">
                  Viewer access — checkboxes and Places edits are locked.
                </p>
              ) : null}
              <ItineraryCanvas
                days={days}
                accommodations={accommodations}
                isEditor={isEditor}
                showTemplates={isDraftRoute}
                onUpdateItem={updateItem}
                onAddPlace={addPlace}
                onFocusStop={(item) => setFocusStopId(item.id)}
              />
            </>
          )}
        </section>

        <section className="min-w-0 lg:sticky lg:top-20">
          <div className="mb-3 flex items-end justify-between gap-3 px-1">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Map
            </h2>
            {mapStops.length > 0 ? (
              <p className="text-sm text-muted-foreground sm:text-base">
                {mapStops.length} mapped stops
              </p>
            ) : null}
          </div>
          {loadingCloud || (isDraftRoute && !hydrated) ? (
            <div className="grid min-h-[420px] place-items-center rounded-2xl border border-border bg-muted/40 sm:min-h-[520px]">
              <p className="text-base text-muted-foreground">Loading map…</p>
            </div>
          ) : (
            <TripMap
              stops={mapStops}
              focusStopId={focusStopId}
              className="h-[min(70vh,640px)]"
            />
          )}
        </section>
      </main>

      {shareOpen && !isDraftRoute && canManage ? (
        <ShareSheet tripId={tripId} onClose={() => setShareOpen(false)} />
      ) : null}
      {matesOpen && !isDraftRoute && canManage ? (
        <TripmatesPanel tripId={tripId} onClose={() => setMatesOpen(false)} />
      ) : null}
    </div>
  );
}
