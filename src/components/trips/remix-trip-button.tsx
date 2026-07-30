"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useGuestTrip } from "@/lib/trips/guest-trip-provider";
import type { GuestTripDraft } from "@/lib/trips/guest-trip";

type Props = {
  slug: string;
  className?: string;
  /** Button label when idle. Defaults to "Start planning". */
  label?: string;
};

export function RemixTripButton({
  slug,
  className,
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
      setPending(false);
      if (!res.ok) {
        setError("Could not start a trip from this template");
        return;
      }
      const data = (await res.json()) as { trip: { id: string } };
      router.push(`/planner/${data.trip.id}`);
      return;
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
    <div className={className}>
      <Button
        type="button"
        size="lg"
        className="text-base"
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
