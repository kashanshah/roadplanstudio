"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Share2,
  Users,
  Save,
  ArrowRight,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { GuestBanner } from "@/components/layout/guest-banner";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuthGate } from "@/components/auth/auth-gate-provider";
import { useSession } from "@/lib/auth-client";
import { useGuestTrip } from "@/lib/trips/guest-trip-provider";
import { ShareSheet } from "@/components/trips/share-sheet";
import { TripmatesPanel } from "@/components/trips/tripmates-panel";

type Props = {
  tripId: string;
};

export function PlannerShell({ tripId }: Props) {
  const isGuest = tripId === "new";
  const { data: session } = useSession();
  const { requireAuth } = useAuthGate();
  const { draft } = useGuestTrip();
  const [shareOpen, setShareOpen] = useState(false);
  const [matesOpen, setMatesOpen] = useState(false);

  const title =
    draft?.title || (isGuest ? "Untitled road trip" : `Trip ${tripId.slice(0, 8)}`);

  async function onSave() {
    if (!session) {
      requireAuth("save");
      return;
    }
    if (isGuest && draft) {
      const res = await fetch("/api/trips/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        const data = (await res.json()) as { tripId: string };
        window.location.href = `/planner/${data.tripId}`;
      }
      return;
    }
  }

  function onShare() {
    if (!session || isGuest) {
      requireAuth("share");
      return;
    }
    setShareOpen(true);
  }

  function onTripmates() {
    if (!session || isGuest) {
      requireAuth("invite");
      return;
    }
    setMatesOpen(true);
  }

  return (
    <div className="flex min-h-full flex-col bg-background text-[17px]">
      {isGuest ? <GuestBanner /> : null}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" aria-label="RoadPlan Studio home">
              <LogoMark className="h-9 w-9" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-base font-medium text-foreground sm:text-lg">
                {title}
              </p>
              <p className="text-sm text-muted-foreground">
                {isGuest
                  ? "Guest draft · local to this browser"
                  : "Cloud trip · synced"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hidden text-base sm:inline-flex"
              onClick={onSave}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-base"
              onClick={onShare}
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
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Tripmates</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 sm:p-8">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            Timeline
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {draft?.startLocation || draft?.endLocation
              ? `Route sketch: ${[draft.startLocation, draft.endLocation].filter(Boolean).join(" → ")}.`
              : "Add days and stops here. Drag-and-drop reordering lands next."}
          </p>
          {isGuest ? (
            <Button
              type="button"
              className="group mt-6 text-base"
              onClick={() => requireAuth("save")}
            >
              Create a free account to save
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Button>
          ) : null}
          {draft?.days?.length ? (
            <ul className="mt-8 space-y-4">
              {draft.days.map((day) => (
                <li key={day.id} className="border-t border-border pt-4">
                  <p className="text-lg font-semibold">{day.title}</p>
                  <p className="text-base text-muted-foreground">
                    {day.items.length
                      ? `${day.items.length} stops`
                      : "No stops yet"}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <section className="min-h-[420px] rounded-2xl border border-dashed border-border bg-muted/30 p-6 sm:p-8">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Map
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Full-screen Google Maps loads via dynamic import in a later pass.
            Seeded trips already carry Place IDs and coordinates.
          </p>
        </section>
      </main>

      {shareOpen && !isGuest ? (
        <ShareSheet tripId={tripId} onClose={() => setShareOpen(false)} />
      ) : null}
      {matesOpen && !isGuest ? (
        <TripmatesPanel tripId={tripId} onClose={() => setMatesOpen(false)} />
      ) : null}
    </div>
  );
}
