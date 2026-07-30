"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Luggage, Share2, Users, Save, Lock } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { AccountMenu } from "@/components/auth/account-menu";
import { PreferencesMenu } from "@/components/layout/preferences-menu";
import { VerifyEmailBanner } from "@/components/auth/verify-email-banner";
import { useAuthGate } from "@/components/auth/auth-gate-provider";
import { GuestBanner } from "@/components/layout/guest-banner";
import { ExportPdfButton } from "@/components/planner/export-pdf-button";
import { ItineraryCanvas } from "@/components/planner/itinerary-canvas";
import { PackingListPanel } from "@/components/planner/packing-list-panel";
import { PlannerEmptyState } from "@/components/planner/planner-empty-state";
import type {
  StopTimingInput,
  CustomStopInput,
} from "@/components/planner/add-stop-search";
import type {
  PlaceDetailsPayload,
  PlannerAccommodation,
  PlannerDay,
  PlannerItem,
  PlannerPackingItem,
  StopStatus,
} from "@/components/planner/planner-types";
import { tip } from "@/components/ui/app-tooltip";
import { Button } from "@/components/ui/button";
import { ShareSheet } from "@/components/trips/share-sheet";
import { TripmatesPanel } from "@/components/trips/tripmates-panel";
import { TripNotesPanel } from "@/components/planner/trip-notes-panel";
import { TripStartPlacePanel } from "@/components/planner/trip-start-place-panel";
import { useSession } from "@/lib/auth-client";
import { SITE_URL } from "@/lib/constants";
import { createDefaultPackingItems } from "@/lib/packing/defaults";
import { useGuestTrip } from "@/lib/trips/guest-trip-provider";
import type { GuestItemType, GuestStopStatus } from "@/lib/trips/guest-trip";
import {
  findDayEndStop,
  MORNING_BASE_NOTE,
  syncNextDayMorningBase,
  toDayEndPlaceFields,
  type DayEndPlaceFields,
} from "@/lib/trips/morning-base";
import { demoteOtherOvernightHotels } from "@/lib/trips/overnight-hotel";
import {
  isTripStartItem,
  pinTripStartFirst,
  TRIP_START_NOTE,
} from "@/lib/trips/trip-start";
import { cn } from "@/lib/utils/cn";

function dayEndSnapshot(
  items: Array<{
    type: string;
    name: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    googlePlaceId?: string | null;
    googleMapsUri?: string | null;
    sortOrder?: number;
    status?: string | null;
  }>,
): DayEndPlaceFields | null {
  const end = findDayEndStop(items);
  return end ? toDayEndPlaceFields(end) : null;
}

function TripTitleEditor({
  title,
  canEdit,
  onSave,
}: {
  title: string;
  canEdit: boolean;
  onSave: (next: string) => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  useEffect(() => {
    if (!editing) setDraft(title);
  }, [title, editing]);

  async function commit() {
    const next = draft.trim().slice(0, 200);
    setEditing(false);
    if (!next || next === title) {
      setDraft(title);
      return;
    }
    await onSave(next);
  }

  if (!canEdit) {
    return (
      <p className="truncate text-sm font-medium text-foreground sm:text-lg">
        {title}
      </p>
    );
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        maxLength={200}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void commit();
          }
          if (e.key === "Escape") {
            setDraft(title);
            setEditing(false);
          }
        }}
        className="w-full min-w-0 rounded-md border border-input bg-background px-1.5 py-0.5 text-sm font-medium outline-none focus:ring-2 focus:ring-ring sm:text-lg"
        aria-label="Trip title"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="block w-full min-w-0 truncate rounded-md text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-lg"
      {...tip("Rename trip")}
    >
      {title}
    </button>
  );
}

function applyMorningBaseSync<
  TDay extends {
    id: string;
    dayIndex: number;
    items: Array<{
      id: string;
      type: string;
      name: string;
      address?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      googlePlaceId?: string | null;
      googleMapsUri?: string | null;
      notes?: string | null;
      sortOrder?: number;
      durationMins?: number | null;
      status?: string;
      timingMode?: "arrive_by" | "depart_at" | null;
      timingMins?: number | null;
      customTravelDurationMins?: number | null;
      customTravelDistanceKm?: number | null;
      travelMode?: "driving" | "walking" | "bicycling" | "transit";
    }>;
  },
>(days: TDay[], changedDayId: string, previousDayEnd: DayEndPlaceFields | null): TDay[] {
  return syncNextDayMorningBase(days, changedDayId, {
    previousDayEnd,
    createMorningBase: (place) =>
      ({
        id: crypto.randomUUID(),
        sortOrder: 0,
        type:
          place.type === "hotel"
            ? "hotel"
            : place.type === "custom"
              ? "custom"
              : "attraction",
        name: place.name,
        address: place.address ?? null,
        latitude: place.latitude ?? null,
        longitude: place.longitude ?? null,
        googlePlaceId: place.googlePlaceId ?? null,
        googleMapsUri: place.googleMapsUri ?? null,
        durationMins: 0,
        timingMode: null,
        timingMins: null,
        customTravelDurationMins: null,
        customTravelDistanceKm: null,
        travelMode: "driving",
        status: "to_visit",
        notes: MORNING_BASE_NOTE,
      }) as TDay["items"][number],
  });
}

const TripMapPanel = dynamic(
  () => import("@/components/planner/planner-maps").then((m) => m.PlannerMaps),
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
    totalDistanceKm?: number | null;
    difficulty?: string | null;
    slug?: string | null;
    startPlaceId: string | null;
    startPlaceName: string | null;
    startAddress: string | null;
    startLatitude: number | null;
    startLongitude: number | null;
  };
  access: {
    isOwner: boolean;
    isEditor: boolean;
    permission: string | null;
  };
  days: PlannerDay[];
  accommodations: PlannerAccommodation[];
  packingItems?: PlannerPackingItem[];
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
  const { draft, hydrated, clearDraft, updateDraft, startPlanning } =
    useGuestTrip();
  const [shareOpen, setShareOpen] = useState(false);
  const [matesOpen, setMatesOpen] = useState(false);
  const [packingOpen, setPackingOpen] = useState(false);
  const [cloud, setCloud] = useState<CloudTripPayload | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [loadingCloud, setLoadingCloud] = useState(!isDraftRoute);
  const [saving, setSaving] = useState(false);
  const [focusStopId, setFocusStopId] = useState<string | null>(null);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [dismissedStarter, setDismissedStarter] = useState(false);
  const [mobilePane, setMobilePane] = useState<"itinerary" | "map">(
    "itinerary",
  );

  // Blank /planner/new always gets a local draft so users can plan without a template.
  useEffect(() => {
    if (!isDraftRoute || !hydrated) return;
    if (!draft) startPlanning();
  }, [isDraftRoute, hydrated, draft, startPlanning]);

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
            isRestDay:
              d.isRestDay === true ||
              (d as { isRestDay?: unknown }).isRestDay === "true",
            items: (d.items ?? []).map((i) => ({
              ...i,
              status: normalizeStatus(i.status),
              googlePlaceId: i.googlePlaceId ?? null,
              googleMapsUri: i.googleMapsUri ?? null,
              durationMins: i.durationMins ?? null,
              timingMode: i.timingMode ?? null,
              timingMins: i.timingMins ?? null,
              customTravelDurationMins: i.customTravelDurationMins ?? null,
              customTravelDistanceKm: i.customTravelDistanceKm ?? null,
              travelMode: i.travelMode ?? "driving",
              latitude: i.latitude ?? null,
              longitude: i.longitude ?? null,
            })),
          })),
          accommodations: data.accommodations ?? [],
          packingItems: (data.packingItems ?? []).map((p) => ({
            id: p.id,
            label: p.label,
            packed: !!p.packed,
            sortOrder: p.sortOrder ?? 0,
            category: p.category ?? null,
          })),
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
        isRestDay: !!d.isRestDay,
        items: d.items
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((i) => ({
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
            timingMode: i.timingMode ?? null,
            timingMins: i.timingMins ?? null,
            customTravelDurationMins: i.customTravelDurationMins ?? null,
            customTravelDistanceKm: i.customTravelDistanceKm ?? null,
            travelMode: i.travelMode ?? "driving",
            status: normalizeStatus(i.status),
          })),
      }));
    }
    return cloud?.days ?? [];
  }, [isDraftRoute, draft, cloud]);

  const accommodations = cloud?.accommodations ?? [];
  const packingList: PlannerPackingItem[] = useMemo(() => {
    if (isDraftRoute) {
      return (draft?.packingItems ?? []).map((p) => ({
        id: p.id,
        label: p.label,
        packed: !!p.packed,
        sortOrder: p.sortOrder,
        category: p.category ?? null,
      }));
    }
    return cloud?.packingItems ?? [];
  }, [isDraftRoute, draft?.packingItems, cloud?.packingItems]);
  const hasTimelineContent = days.some((d) => d.items.length > 0);
  const showStarter =
    isDraftRoute && !hasTimelineContent && !dismissedStarter && !!draft;

  useEffect(() => {
    if (!days.length) {
      setActiveDayId(null);
      return;
    }
    // Keep selection if still valid; otherwise fall back to the first day.
    if (activeDayId && days.some((d) => d.id === activeDayId)) return;
    setActiveDayId(days[0]!.id);
  }, [days, activeDayId]);

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

  async function refreshCloudTrip() {
    const refresh = await fetch(`/api/trips/${tripId}`);
    if (!refresh.ok) return;
    const data = (await refresh.json()) as CloudTripPayload;
    setCloud(data);
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
    patch: Partial<
      Pick<
        PlannerItem,
        | "status"
        | "durationMins"
        | "notes"
        | "travelMode"
        | "timingMode"
        | "timingMins"
        | "customTravelDurationMins"
        | "customTravelDistanceKm"
        | "type"
      >
    >,
  ) {
    if (!isEditor) return;

    const hostDay = days.find((day) =>
      day.items.some((item) => item.id === itemId),
    );
    // Place swaps go through replacePlace; here only type/status can change day-end.
    const mayChangeDayEnd = patch.type != null || patch.status != null;
    const previousDayEnd =
      mayChangeDayEnd && hostDay ? dayEndSnapshot(hostDay.items) : null;

    if (isDraftRoute) {
      updateDraft((current) => {
        const nextDays = current.days.map((day) => ({
          ...day,
          items: day.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  ...patch,
                  status: (patch.status ?? item.status) as GuestStopStatus,
                  type: (patch.type ?? item.type) as GuestItemType,
                }
              : item,
          ),
        }));
        return {
          ...current,
          days:
            previousDayEnd != null && hostDay
              ? applyMorningBaseSync(nextDays, hostDay.id, previousDayEnd)
              : nextDays,
        };
      });
      return;
    }

    setCloud((prev) => {
      if (!prev) return prev;
      const nextDays = prev.days.map((day) => ({
        ...day,
        items: day.items.map((item) =>
          item.id === itemId ? { ...item, ...patch } : item,
        ),
      }));
      return {
        ...prev,
        days:
          previousDayEnd != null && hostDay
            ? applyMorningBaseSync(nextDays, hostDay.id, previousDayEnd)
            : nextDays,
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
      return;
    }
    if (mayChangeDayEnd) {
      await refreshCloudTrip();
    }
  }

  async function deleteItem(itemId: string) {
    if (!isEditor) return;

    setFocusStopId((prev) => (prev === itemId ? null : prev));

    const hostDay = days.find((day) =>
      day.items.some((item) => item.id === itemId),
    );
    const previousDayEnd = hostDay
      ? dayEndSnapshot(hostDay.items)
      : null;

    if (isDraftRoute) {
      updateDraft((current) => {
        const nextDays = current.days.map((day) => ({
          ...day,
          items: day.items
            .filter((item) => item.id !== itemId)
            .map((item, index) => ({ ...item, sortOrder: index })),
        }));
        return {
          ...current,
          days: hostDay
            ? applyMorningBaseSync(nextDays, hostDay.id, previousDayEnd)
            : nextDays,
        };
      });
      return;
    }

    setCloud((prev) => {
      if (!prev) return prev;
      const nextDays = prev.days.map((day) => ({
        ...day,
        items: day.items
          .filter((item) => item.id !== itemId)
          .map((item, index) => ({ ...item, sortOrder: index })),
      }));
      return {
        ...prev,
        days: hostDay
          ? applyMorningBaseSync(nextDays, hostDay.id, previousDayEnd)
          : nextDays,
      };
    });

    const res = await fetch(`/api/trips/${tripId}/items/${itemId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      console.error("Failed to delete item");
      return;
    }
    await refreshCloudTrip();
  }

  async function replacePlace(
    itemId: string,
    next: {
      name: string;
      address: string | null;
      latitude: number | null;
      longitude: number | null;
      googlePlaceId: string | null;
      googleMapsUri: string | null;
      type: "attraction" | "hotel" | "custom";
    },
  ) {
    if (!isEditor) return;

    const existing = days
      .flatMap((day) => day.items)
      .find((item) => item.id === itemId);
    if (!existing) return;

    if (isTripStartItem(existing)) {
      await updateTripStart({
        placeId: next.googlePlaceId,
        name: next.name,
        address: next.address,
        latitude: next.latitude,
        longitude: next.longitude,
      });
      return;
    }

    const patch = {
      name: next.name,
      address: next.address,
      latitude: next.latitude,
      longitude: next.longitude,
      googlePlaceId: next.googlePlaceId,
      googleMapsUri: next.googleMapsUri,
      type: next.type,
    };

    const hostDay = days.find((day) =>
      day.items.some((item) => item.id === itemId),
    );
    const previousDayEnd = hostDay
      ? dayEndSnapshot(hostDay.items)
      : null;

    if (isDraftRoute) {
      updateDraft((current) => {
        const nextDays = current.days.map((day) => {
          if (!day.items.some((item) => item.id === itemId)) return day;
          const nextItems = day.items.map((item) =>
            item.id === itemId ? { ...item, ...patch } : item,
          );
          return {
            ...day,
            items:
              next.type === "hotel"
                ? demoteOtherOvernightHotels(nextItems, itemId)
                : nextItems,
          };
        });
        return {
          ...current,
          days: hostDay
            ? applyMorningBaseSync(nextDays, hostDay.id, previousDayEnd)
            : nextDays,
        };
      });
      return;
    }

    setCloud((prev) => {
      if (!prev) return prev;
      const nextDays = prev.days.map((day) => {
        if (!day.items.some((item) => item.id === itemId)) return day;
        const nextItems = day.items.map((item) =>
          item.id === itemId ? { ...item, ...patch } : item,
        );
        return {
          ...day,
          items:
            next.type === "hotel"
              ? demoteOtherOvernightHotels(nextItems, itemId)
              : nextItems,
        };
      });
      return {
        ...prev,
        days: hostDay
          ? applyMorningBaseSync(nextDays, hostDay.id, previousDayEnd)
          : nextDays,
      };
    });

    const res = await fetch(`/api/trips/${tripId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      console.error("Failed to replace place");
      return;
    }
    await refreshCloudTrip();
  }

  async function reorderDay(dayId: string, orderedItemIds: string[]) {
    if (!isEditor) return;

    const day = days.find((d) => d.id === dayId);
    const previousDayEnd = day ? dayEndSnapshot(day.items) : null;
    const pinnedIds =
      day?.dayIndex === 1
        ? pinTripStartFirst(
            orderedItemIds.map((id) => {
              const item = day.items.find((i) => i.id === id);
              return { id, notes: item?.notes ?? null };
            }),
          ).map((item) => item.id)
        : orderedItemIds;

    if (isDraftRoute) {
      updateDraft((current) => {
        const nextDays = current.days.map((d) => {
          if (d.id !== dayId) return d;
          const byId = new Map(d.items.map((item) => [item.id, item]));
          return {
            ...d,
            items: pinnedIds
              .map((id, index) => {
                const item = byId.get(id);
                if (!item) return null;
                return { ...item, sortOrder: index };
              })
              .filter((item): item is NonNullable<typeof item> => item != null),
          };
        });
        return {
          ...current,
          days: applyMorningBaseSync(nextDays, dayId, previousDayEnd),
        };
      });
      return;
    }

    setCloud((prev) => {
      if (!prev) return prev;
      const nextDays = prev.days.map((d) => {
        if (d.id !== dayId) return d;
        const byId = new Map(d.items.map((item) => [item.id, item]));
        return {
          ...d,
          items: pinnedIds
            .map((id, index) => {
              const item = byId.get(id);
              if (!item) return null;
              return { ...item, sortOrder: index };
            })
            .filter((item): item is PlannerItem => item != null),
        };
      });
      return {
        ...prev,
        days: applyMorningBaseSync(nextDays, dayId, previousDayEnd),
      };
    });

    const res = await fetch(`/api/trips/${tripId}/items/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayId, orderedItemIds: pinnedIds }),
    });
    if (!res.ok) {
      console.error("Failed to reorder items");
      return;
    }
    await refreshCloudTrip();
  }

  async function addPlace(
    dayId: string,
    place: PlaceDetailsPayload,
    asHotel: boolean,
    timing: StopTimingInput,
  ) {
    if (!isEditor) return;
    const type: GuestItemType = asHotel ? "hotel" : "attraction";
    const targetDay = days.find((day) => day.id === dayId);
    const shouldBecomeTripStart =
      targetDay?.dayIndex === 1 &&
      targetDay.items.length === 0 &&
      !targetDay.items.some(isTripStartItem);

    // First place on an empty Day 1 becomes Trip Start (Day 1 stop 1).
    if (shouldBecomeTripStart) {
      await updateTripStart({
        placeId: place.placeId,
        name: place.name,
        address: place.formattedAddress,
        latitude: place.latitude,
        longitude: place.longitude,
      });
      return;
    }

    const previousDayEnd = targetDay
      ? dayEndSnapshot(targetDay.items)
      : null;

    if (isDraftRoute) {
      updateDraft((current) => {
        const nextDays = current.days.map((day) => {
          if (day.id !== dayId) return day;
          const sortOrder = day.items.length;
          const newId = crypto.randomUUID();
          const nextItems = [
            ...day.items,
            {
              id: newId,
              sortOrder,
              type,
              name: place.name,
              address: place.formattedAddress,
              latitude: place.latitude,
              longitude: place.longitude,
              googlePlaceId: place.placeId,
              durationMins:
                timing.durationMins ?? place.estimatedDurationMins ?? null,
              timingMode: timing.timingMode,
              timingMins: timing.timingMins,
              customTravelDurationMins: null,
              customTravelDistanceKm: null,
              travelMode: "driving" as const,
              status: "to_visit" as const,
              notes: null,
            },
          ];
          return {
            ...day,
            items:
              type === "hotel"
                ? demoteOtherOvernightHotels(nextItems, newId)
                : nextItems,
          };
        });
        return {
          ...current,
          days: applyMorningBaseSync(nextDays, dayId, previousDayEnd),
        };
      });
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
        durationMins: timing.durationMins ?? place.estimatedDurationMins,
        timingMode: timing.timingMode,
        timingMins: timing.timingMins,
      }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { item: PlannerItem };
    setCloud((prev) => {
      if (!prev) return prev;
      const nextDays = prev.days.map((day) => {
        if (day.id !== dayId) return day;
        const nextItems = [
          ...day.items,
          {
            ...data.item,
            status: normalizeStatus(data.item.status),
            customTravelDurationMins:
              data.item.customTravelDurationMins ?? null,
            customTravelDistanceKm: data.item.customTravelDistanceKm ?? null,
            travelMode: data.item.travelMode ?? "driving",
          },
        ];
        return {
          ...day,
          items:
            type === "hotel"
              ? demoteOtherOvernightHotels(nextItems, data.item.id)
              : nextItems,
        };
      });
      return {
        ...prev,
        days: applyMorningBaseSync(nextDays, dayId, previousDayEnd),
      };
    });
    await refreshCloudTrip();
  }

  async function addCustomPlace(dayId: string, input: CustomStopInput) {
    if (!isEditor) return;
    const type: GuestItemType = input.asHotel ? "hotel" : "custom";
    const targetDay = days.find((day) => day.id === dayId);
    const previousDayEnd = targetDay
      ? dayEndSnapshot(targetDay.items)
      : null;

    if (isDraftRoute) {
      updateDraft((current) => {
        const nextDays = current.days.map((day) => {
          if (day.id !== dayId) return day;
          const sortOrder = day.items.length;
          const newId = crypto.randomUUID();
          const nextItems = [
            ...day.items,
            {
              id: newId,
              sortOrder,
              type,
              name: input.name,
              address: input.address ?? null,
              latitude: null,
              longitude: null,
              googlePlaceId: null,
              durationMins: input.timing?.durationMins ?? null,
              timingMode: input.timing?.timingMode ?? null,
              timingMins: input.timing?.timingMins ?? null,
              customTravelDurationMins: null,
              customTravelDistanceKm: null,
              travelMode: "driving" as const,
              status: "to_visit" as const,
              notes: input.notes ?? null,
            },
          ];
          return {
            ...day,
            items:
              type === "hotel"
                ? demoteOtherOvernightHotels(nextItems, newId)
                : nextItems,
          };
        });
        return {
          ...current,
          days: applyMorningBaseSync(nextDays, dayId, previousDayEnd),
        };
      });
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
        name: input.name,
        address: input.address ?? null,
        notes: input.notes ?? null,
        type,
        durationMins: input.timing?.durationMins ?? null,
        timingMode: input.timing?.timingMode ?? null,
        timingMins: input.timing?.timingMins ?? null,
      }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { item: PlannerItem };
    setCloud((prev) => {
      if (!prev) return prev;
      const nextDays = prev.days.map((day) => {
        if (day.id !== dayId) return day;
        const nextItems = [
          ...day.items,
          {
            ...data.item,
            status: normalizeStatus(data.item.status),
            customTravelDurationMins:
              data.item.customTravelDurationMins ?? null,
            customTravelDistanceKm: data.item.customTravelDistanceKm ?? null,
            travelMode: data.item.travelMode ?? "driving",
          },
        ];
        return {
          ...day,
          items:
            type === "hotel"
              ? demoteOtherOvernightHotels(nextItems, data.item.id)
              : nextItems,
        };
      });
      return {
        ...prev,
        days: applyMorningBaseSync(nextDays, dayId, previousDayEnd),
      };
    });
    await refreshCloudTrip();
  }

  async function addDay(opts?: { isRestDay?: boolean }) {
    if (!isEditor) return;
    const isRestDay = opts?.isRestDay === true;

    if (isDraftRoute) {
      updateDraft((current) => {
        const ordered = [...current.days].sort(
          (a, b) => a.dayIndex - b.dayIndex,
        );
        const prevDay = ordered[ordered.length - 1] ?? null;
        const dayIndex = ordered.length + 1;
        const day = {
          id: crypto.randomUUID(),
          dayIndex,
          title: isRestDay ? "Rest day" : `Day ${dayIndex}`,
          isRestDay,
          items: [],
        };
        let nextDays = [...current.days, day];
        // Seed stop 1 from the previous day's last active location.
        if (prevDay) {
          nextDays = applyMorningBaseSync(
            nextDays,
            prevDay.id,
            dayEndSnapshot(prevDay.items),
          );
        }
        return {
          ...current,
          durationDays: dayIndex,
          days: nextDays,
        };
      });
      return;
    }

    if (!isLoggedIn) {
      requireAuth("save");
      return;
    }

    const prevDay = [...days].sort((a, b) => a.dayIndex - b.dayIndex).at(-1);
    const previousDayEnd = prevDay ? dayEndSnapshot(prevDay.items) : null;

    const res = await fetch(`/api/trips/${tripId}/days`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRestDay }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      day: PlannerDay;
    };
    setCloud((prev) => {
      if (!prev) return prev;
      let nextDays = [
        ...prev.days,
        {
          ...data.day,
          isRestDay: !!data.day.isRestDay,
          items: data.day.items ?? [],
        },
      ];
      if (prevDay) {
        nextDays = applyMorningBaseSync(
          nextDays,
          prevDay.id,
          previousDayEnd,
        );
      }
      return {
        ...prev,
        days: nextDays,
      };
    });
    setActiveDayId(data.day.id);
    await refreshCloudTrip();
  }

  async function updateTripStart(
    place: {
      placeId: string | null;
      name: string | null;
      address: string | null;
      latitude: number | null;
      longitude: number | null;
    } | null,
  ) {
    if (!isEditor) return;

    if (isDraftRoute) {
      updateDraft((current) => {
        const day1 = [...current.days].sort(
          (a, b) => a.dayIndex - b.dayIndex,
        )[0];
        if (!day1) {
          return {
            ...current,
            startLocation: place?.name || undefined,
            startPlaceId: place?.placeId ?? null,
            startAddress: place?.address ?? null,
            startLatitude: place?.latitude ?? null,
            startLongitude: place?.longitude ?? null,
          };
        }

        const others = day1.items
          .filter((item) => !isTripStartItem(item))
          .sort((a, b) => a.sortOrder - b.sortOrder);

        const nextItems = place?.name
          ? [
              {
                id:
                  day1.items.find((item) => isTripStartItem(item))?.id ??
                  crypto.randomUUID(),
                sortOrder: 0,
                type: "custom" as const,
                name: place.name,
                address: place.address,
                latitude: place.latitude,
                longitude: place.longitude,
                googlePlaceId: place.placeId,
                durationMins: 0,
                timingMode: null,
                timingMins: null,
                customTravelDurationMins: null,
                customTravelDistanceKm: null,
                travelMode: "driving" as const,
                status: "to_visit" as const,
                notes: TRIP_START_NOTE,
              },
              ...others.map((item, index) => ({
                ...item,
                sortOrder: index + 1,
              })),
            ]
          : others.map((item, index) => ({ ...item, sortOrder: index }));

        return {
          ...current,
          startLocation: place?.name || undefined,
          startPlaceId: place?.placeId ?? null,
          startAddress: place?.address ?? null,
          startLatitude: place?.latitude ?? null,
          startLongitude: place?.longitude ?? null,
          days: current.days.map((day) =>
            day.id === day1.id ? { ...day, items: nextItems } : day,
          ),
        };
      });
      return;
    }

    setCloud((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        trip: {
          ...prev.trip,
          startPlaceId: place?.placeId ?? null,
          startPlaceName: place?.name ?? null,
          startAddress: place?.address ?? null,
          startLatitude: place?.latitude ?? null,
          startLongitude: place?.longitude ?? null,
        },
      };
    });

    const res = await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startPlaceId: place?.placeId ?? null,
        startPlaceName: place?.name ?? null,
        startAddress: place?.address ?? null,
        startLatitude: place?.latitude ?? null,
        startLongitude: place?.longitude ?? null,
      }),
    });
    if (!res.ok) {
      const refresh = await fetch(`/api/trips/${tripId}`);
      if (refresh.ok) {
        const data = (await refresh.json()) as CloudTripPayload;
        setCloud(data);
      }
      return;
    }

    // Keep Day 1's opening stop in sync with Trip Start.
    const day1 = [...days].sort((a, b) => a.dayIndex - b.dayIndex)[0];
    if (!day1) return;
    const ordered = [...day1.items].sort((a, b) => a.sortOrder - b.sortOrder);
    const existingStart = ordered.find((item) => isTripStartItem(item));

    if (!place?.name) {
      if (existingStart) {
        await fetch(`/api/trips/${tripId}/items/${existingStart.id}`, {
          method: "DELETE",
        });
        setCloud((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            days: prev.days.map((day) =>
              day.id === day1.id
                ? {
                    ...day,
                    items: day.items
                      .filter((item) => item.id !== existingStart.id)
                      .map((item, index) => ({ ...item, sortOrder: index })),
                  }
                : day,
            ),
          };
        });
      }
      return;
    }

    if (existingStart) {
      const patchRes = await fetch(
        `/api/trips/${tripId}/items/${existingStart.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: place.name,
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
            googlePlaceId: place.placeId,
            notes: TRIP_START_NOTE,
            durationMins: 0,
            type: "custom",
            sortOrder: 0,
          }),
        },
      );
      if (patchRes.ok) {
        const data = (await patchRes.json()) as { item: PlannerItem };
        setCloud((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            days: prev.days.map((day) =>
              day.id === day1.id
                ? {
                    ...day,
                    items: day.items.map((item) =>
                      item.id === existingStart.id
                        ? {
                            ...item,
                            ...data.item,
                            status: normalizeStatus(data.item.status),
                            travelMode: data.item.travelMode ?? "driving",
                          }
                        : item,
                    ),
                  }
                : day,
            ),
          };
        });
      }
      return;
    }

    const createRes = await fetch(`/api/trips/${tripId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayId: day1.id,
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        googlePlaceId: place.placeId ?? undefined,
        type: "custom",
        notes: TRIP_START_NOTE,
        durationMins: 0,
        sortOrder: 0,
      }),
    });
    if (!createRes.ok) return;
    const data = (await createRes.json()) as { item: PlannerItem };
    setCloud((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((day) =>
          day.id === day1.id
            ? {
                ...day,
                items: [
                  {
                    ...data.item,
                    status: normalizeStatus(data.item.status),
                    customTravelDurationMins:
                      data.item.customTravelDurationMins ?? null,
                    customTravelDistanceKm:
                      data.item.customTravelDistanceKm ?? null,
                    travelMode: data.item.travelMode ?? "driving",
                  },
                  ...day.items.map((item) => ({
                    ...item,
                    sortOrder: item.sortOrder + 1,
                  })),
                ],
              }
            : day,
        ),
      };
    });
  }

  async function updateTripTitle(nextTitle: string) {
    if (!isEditor) return;
    const title = nextTitle.trim().slice(0, 200);
    if (!title) return;

    if (isDraftRoute) {
      updateDraft((current) => ({
        ...current,
        title,
      }));
      return;
    }

    setCloud((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        trip: { ...prev.trip, title },
      };
    });

    const res = await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const refresh = await fetch(`/api/trips/${tripId}`);
      if (refresh.ok) {
        const data = (await refresh.json()) as CloudTripPayload;
        setCloud(data);
      }
    }
  }

  async function updateTripNotes(notes: string | null) {
    if (!isEditor) return;

    if (isDraftRoute) {
      updateDraft((current) => ({
        ...current,
        description: notes ?? "",
      }));
      return;
    }

    setCloud((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        trip: { ...prev.trip, description: notes },
      };
    });

    const res = await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: notes }),
    });
    if (!res.ok) {
      // reload to recover
      const refresh = await fetch(`/api/trips/${tripId}`);
      if (refresh.ok) {
        const data = (await refresh.json()) as CloudTripPayload;
        setCloud(data);
      }
    }
  }

  async function addPackingItem(label: string) {
    if (!isEditor) return;
    if (isDraftRoute) {
      updateDraft((current) => {
        const existing = current.packingItems ?? [];
        const sortOrder = existing.length
          ? Math.max(...existing.map((i) => i.sortOrder)) + 1
          : 0;
        return {
          ...current,
          packingItems: [
            ...existing,
            {
              id: crypto.randomUUID(),
              label,
              packed: false,
              sortOrder,
            },
          ],
        };
      });
      return;
    }

    const res = await fetch(`/api/trips/${tripId}/packing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { item: PlannerPackingItem };
    setCloud((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        packingItems: [...(prev.packingItems ?? []), data.item],
      };
    });
  }

  async function togglePackingItem(id: string, packed: boolean) {
    if (!isEditor) return;
    if (isDraftRoute) {
      updateDraft((current) => ({
        ...current,
        packingItems: (current.packingItems ?? []).map((item) =>
          item.id === id ? { ...item, packed } : item,
        ),
      }));
      return;
    }

    setCloud((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        packingItems: (prev.packingItems ?? []).map((item) =>
          item.id === id ? { ...item, packed } : item,
        ),
      };
    });

    const res = await fetch(`/api/trips/${tripId}/packing/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packed }),
    });
    if (!res.ok) {
      const refresh = await fetch(`/api/trips/${tripId}`);
      if (refresh.ok) {
        const data = (await refresh.json()) as CloudTripPayload;
        setCloud({
          ...data,
          packingItems: data.packingItems ?? [],
        });
      }
    }
  }

  async function deletePackingItem(id: string) {
    if (!isEditor) return;
    if (isDraftRoute) {
      updateDraft((current) => ({
        ...current,
        packingItems: (current.packingItems ?? []).filter(
          (item) => item.id !== id,
        ),
      }));
      return;
    }

    setCloud((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        packingItems: (prev.packingItems ?? []).filter(
          (item) => item.id !== id,
        ),
      };
    });

    await fetch(`/api/trips/${tripId}/packing/${id}`, { method: "DELETE" });
  }

  async function seedPackingDefaults() {
    if (!isEditor) return;
    if (isDraftRoute) {
      updateDraft((current) => ({
        ...current,
        packingItems: createDefaultPackingItems((item) => ({
          id: crypto.randomUUID(),
          ...item,
        })),
      }));
      return;
    }

    const res = await fetch(`/api/trips/${tripId}/packing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seedDefaults: true }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { items: PlannerPackingItem[] };
    setCloud((prev) => {
      if (!prev) return prev;
      return { ...prev, packingItems: data.items };
    });
  }

  async function updateDay(
    dayId: string,
    patch: Partial<
      Pick<
        PlannerDay,
        "title" | "notes" | "date" | "routeSummary" | "isRestDay"
      >
    >,
  ) {
    if (!isEditor) return;

    if (isDraftRoute) {
      updateDraft((current) => ({
        ...current,
        days: current.days.map((day) =>
          day.id === dayId ? { ...day, ...patch } : day,
        ),
      }));
      return;
    }

    setCloud((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((day) =>
          day.id === dayId ? { ...day, ...patch } : day,
        ),
      };
    });

    const res = await fetch(`/api/trips/${tripId}/days/${dayId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      console.error("Failed to update day");
    }
  }

  async function deleteDay(dayId: string) {
    if (!isEditor) return;
    if (days.length <= 1) return;

    if (isDraftRoute) {
      updateDraft((current) => {
        const nextDays = current.days
          .filter((day) => day.id !== dayId)
          .map((day, index) => ({
            ...day,
            dayIndex: index + 1,
          }));
        return {
          ...current,
          durationDays: Math.max(1, nextDays.length),
          days: nextDays,
        };
      });
      setActiveDayId((prev) => (prev === dayId ? null : prev));
      return;
    }

    const previous = cloud;
    setCloud((prev) => {
      if (!prev) return prev;
      const nextDays = prev.days
        .filter((day) => day.id !== dayId)
        .map((day, index) => ({
          ...day,
          dayIndex: index + 1,
        }));
      return { ...prev, days: nextDays };
    });
    setActiveDayId((prev) => (prev === dayId ? null : prev));

    const res = await fetch(`/api/trips/${tripId}/days/${dayId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      console.error("Failed to delete day");
      if (previous) setCloud(previous);
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-background text-[17px]">
      {isAnonymous ? <GuestBanner /> : null}
      {!isAnonymous ? <VerifyEmailBanner /> : null}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-20 sm:gap-3 sm:px-6">
          <div className="grid gap-0">
            <Link
              href="/planner"
              aria-label="Back to planner"
              {...tip("Back to planner")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Planner</span>
            </Link>
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <Link
                href={isLoggedIn ? "/planner" : "/"}
                aria-label={isLoggedIn ? "Your trips" : "RoadPlan Studio home"}
                {...tip(isLoggedIn ? "Your trips" : "Home")}
                className="shrink-0"
              >
                <LogoMark className="h-8 w-8 sm:h-9 sm:w-9" />
              </Link>
              <div className="min-w-0">
                <TripTitleEditor
                  title={title}
                  canEdit={isEditor}
                  onSave={updateTripTitle}
                />
                <p className="hidden truncate text-sm text-muted-foreground sm:flex sm:items-center sm:gap-1.5 leading-none">
                  {!isDraftRoute && cloud && !isEditor ? (
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                  ) : null}
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            {isDraftRoute ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hidden text-base md:inline-flex"
                onClick={onSave}
                disabled={saving || (isLoggedIn && !draft)}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : isLoggedIn ? "Save trip" : "Save"}
              </Button>
            ) : null}
            <ExportPdfButton
              title={title}
              description={
                isDraftRoute
                  ? (draft?.description ?? null)
                  : (cloud?.trip.description ?? null)
              }
              days={days}
              accommodations={accommodations}
              durationDays={
                isDraftRoute
                  ? (draft?.durationDays ?? days.length)
                  : cloud?.trip.durationDays
              }
              totalDistanceKm={cloud?.trip.totalDistanceKm ?? null}
              difficulty={cloud?.trip.difficulty ?? null}
              visibility={cloud?.trip.visibility ?? null}
              plannerUrl={isDraftRoute ? null : `${SITE_URL}/planner/${tripId}`}
              startLocation={draft?.startLocation ?? null}
              endLocation={draft?.endLocation ?? null}
              packingItems={packingList}
            />
            {(isEditor || packingList.length > 0) &&
            !loadingCloud &&
            (isDraftRoute ? hydrated : !!cloud) ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-10 min-w-10 px-2 text-base sm:px-3.5"
                onClick={() => setPackingOpen(true)}
                aria-label="Packing list"
                {...tip("Packing list")}
              >
                <Luggage className="h-4 w-4" />
                <span className="hidden sm:inline">Packing</span>
                {packingList.length > 0 ? (
                  <span className="hidden rounded-full bg-secondary px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-secondary-foreground sm:inline">
                    {packingList.filter((i) => i.packed).length}/
                    {packingList.length}
                  </span>
                ) : null}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-10 min-w-10 px-2 text-base sm:px-3.5"
              onClick={onShare}
              disabled={!isDraftRoute && !!cloud && !canManage}
              aria-label="Share trip"
              {...tip("Share trip")}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-10 min-w-10 px-2 text-base sm:px-3.5"
              onClick={onTripmates}
              disabled={!isDraftRoute && !!cloud && !canManage}
              aria-label="Invite tripmates"
              {...tip("Invite tripmates")}
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Tripmates</span>
            </Button>
            <PreferencesMenu />
            <AccountMenu compact />
          </div>
        </div>
      </header>

      <div className="sticky top-14 z-30 border-b border-border bg-background/95 px-3 py-2 backdrop-blur-md sm:top-16 lg:hidden">
        <div
          role="tablist"
          aria-label="Planner view"
          className="mx-auto flex max-w-7xl rounded-full border border-border bg-card p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobilePane === "itinerary"}
            onClick={() => setMobilePane("itinerary")}
            className={cn(
              "min-h-10 flex-1 rounded-full px-3 text-sm font-medium transition-colors",
              mobilePane === "itinerary"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Itinerary
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobilePane === "map"}
            onClick={() => setMobilePane("map")}
            className={cn(
              "min-h-10 flex-1 rounded-full px-3 text-sm font-medium transition-colors",
              mobilePane === "map"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Map
          </button>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <section
          className={cn(
            "min-w-0",
            mobilePane !== "itinerary" && "hidden lg:block",
          )}
        >
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
          ) : (
            <>
              {showStarter ? (
                <div className="mb-5">
                  <PlannerEmptyState
                    isLoggedIn={isLoggedIn}
                    onStartBlank={() => {
                      setDismissedStarter(true);
                      if (days[0]?.id) setActiveDayId(days[0].id);
                    }}
                  />
                </div>
              ) : null}
              {isDraftRoute && draft?.endLocation ? (
                <p className="mb-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Heading toward {draft.endLocation}
                  {draft.startLocation ? ` from ${draft.startLocation}` : ""}.
                </p>
              ) : null}
              {!loadingCloud && (isDraftRoute ? hydrated : !!cloud) ? (
                <>
                  <TripStartPlacePanel
                    value={
                      isDraftRoute
                        ? {
                            placeId: draft?.startPlaceId ?? null,
                            name: draft?.startLocation ?? null,
                            address: draft?.startAddress ?? null,
                            latitude: draft?.startLatitude ?? null,
                            longitude: draft?.startLongitude ?? null,
                          }
                        : {
                            placeId: cloud?.trip.startPlaceId ?? null,
                            name: cloud?.trip.startPlaceName ?? null,
                            address: cloud?.trip.startAddress ?? null,
                            latitude: cloud?.trip.startLatitude ?? null,
                            longitude: cloud?.trip.startLongitude ?? null,
                          }
                    }
                    isEditor={isEditor}
                    onSave={updateTripStart}
                  />
                  <TripNotesPanel
                    notes={
                      isDraftRoute
                        ? (draft?.description ?? null)
                        : cloud?.trip.description
                    }
                    isEditor={isEditor}
                    onSave={updateTripNotes}
                  />
                </>
              ) : null}
              {!isDraftRoute && cloud && !isEditor ? (
                <p className="mb-4 rounded-2xl bg-secondary px-4 py-3 text-base text-muted-foreground">
                  Viewer access — checkboxes and Places edits are locked.
                </p>
              ) : null}
              {days.length > 0 ? (
                <ItineraryCanvas
                  days={days}
                  isEditor={isEditor}
                  showTemplates={
                    isDraftRoute && !hasTimelineContent && dismissedStarter
                  }
                  onUpdateItem={updateItem}
                  onDeleteItem={deleteItem}
                  onReplaceItem={replacePlace}
                  onClearTripStart={() => updateTripStart(null)}
                  onUpdateDay={updateDay}
                  onDeleteDay={deleteDay}
                  onReorderDay={reorderDay}
                  onCustomTravelChange={(itemId, patch) => {
                    void updateItem(itemId, patch);
                  }}
                  onAddPlace={addPlace}
                  onAddCustomPlace={addCustomPlace}
                  onAddDay={addDay}
                  onFocusStop={(item) => {
                    setFocusStopId(item.id);
                    setMobilePane("map");
                  }}
                  activeDayId={activeDayId}
                  onSelectDay={setActiveDayId}
                />
              ) : (
                <p className="text-base text-muted-foreground">
                  Preparing your blank itinerary…
                </p>
              )}
            </>
          )}
        </section>

        <section
          className={cn(
            "min-w-0 lg:sticky lg:top-20",
            mobilePane !== "map" && "hidden lg:block",
          )}
        >
          <div className="mb-3 px-1">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Maps
            </h2>
          </div>
          {loadingCloud || (isDraftRoute && !hydrated) ? (
            <div className="grid min-h-[420px] place-items-center rounded-2xl border border-border bg-muted/40 sm:min-h-[520px]">
              <p className="text-base text-muted-foreground">Loading map…</p>
            </div>
          ) : (
            <TripMapPanel
              days={days}
              focusStopId={focusStopId}
              activeDayId={activeDayId}
              onActiveDayChange={(dayId) => {
                setActiveDayId(dayId);
                setMobilePane("itinerary");
              }}
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
      <PackingListPanel
        open={packingOpen}
        onClose={() => setPackingOpen(false)}
        items={packingList}
        isEditor={isEditor}
        onAdd={addPackingItem}
        onToggle={togglePackingItem}
        onDelete={deletePackingItem}
        onSeedDefaults={seedPackingDefaults}
      />
    </div>
  );
}
