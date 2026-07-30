"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useGuestTrip } from "@/lib/trips/guest-trip-provider";
import type { GuestTripDraft } from "@/lib/trips/guest-trip";
import { cn } from "@/lib/utils/cn";

type Props = {
  slug: string;
  className?: string;
  fullWidthOnMobile?: boolean;
  /** Button label when idle. Defaults to "Start planning". */
  label?: string;
};

export function RemixTripButton({
  slug,
  className,
  fullWidthOnMobile = false,
  label = "Start planning",
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { loadDraft } = useGuestTrip();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRemix() {
    setPending(true);
    setError(null);

    // Signed-in: duplicate template into a new owned cloud trip.
    if (session) {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug: slug }),
      });
      if (res.ok) {
        setPending(false);
        const data = (await res.json()) as { trip: { id: string } };
        router.push(`/planner/${data.trip.id}`);
        return;
      }

      // If the template isn't available in cloud yet, fall back to a guest draft
      // so users can still enter the planner immediately.
    }

    // Guest: load template as a local draft in the planner.
    const res = await fetch(
      `/api/trips/templates/${encodeURIComponent(slug)}/draft`,
    );
    setPending(false);
    if (!res.ok) {
      setError("Could not load this template");
      return;
    }
    const data = (await res.json()) as { draft: GuestTripDraft };
    loadDraft(data.draft);
    router.push("/planner/new");
  }

  return (
    <div className={cn(fullWidthOnMobile ? "w-full sm:w-auto" : null, className)}>
      <Button
        type="button"
        size="lg"
        className={cn("text-base", fullWidthOnMobile ? "w-full sm:w-auto" : null)}
        disabled={pending}
        onClick={() => void onRemix()}
      >
        {pending ? "Starting…" : label}
      </Button>
      {error ? (
        <p className="mt-2 text-base text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
