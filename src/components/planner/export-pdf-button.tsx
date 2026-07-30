"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import type {
  PlannerAccommodation,
  PlannerDay,
  PlannerPackingItem,
} from "@/components/planner/planner-types";
import { Button } from "@/components/ui/button";
import { tip } from "@/components/ui/app-tooltip";
import { buildTripPdfModel } from "@/lib/pdf/build-trip-pdf-model";
import { SITE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

type Props = {
  title: string;
  description?: string | null;
  days: PlannerDay[];
  accommodations?: PlannerAccommodation[];
  packingItems?: PlannerPackingItem[];
  durationDays?: number;
  totalDistanceKm?: number | null;
  difficulty?: string | null;
  visibility?: string | null;
  plannerUrl?: string | null;
  startLocation?: string | null;
  endLocation?: string | null;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "ghost" | "outline" | "secondary" | "default";
};

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "roadplan-trip"
  );
}

export function ExportPdfButton({
  title,
  description,
  days,
  accommodations = [],
  packingItems = [],
  durationDays,
  totalDistanceKm,
  difficulty,
  visibility,
  plannerUrl,
  startLocation,
  endLocation,
  className,
  size = "sm",
  variant = "ghost",
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canExport = days.length > 0;

  async function onExport() {
    if (!canExport || pending) return;
    setPending(true);
    setError(null);
    try {
      const [{ pdf }, { TripPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/trip-pdf-document"),
      ]);

      const model = buildTripPdfModel({
        title,
        description,
        days,
        accommodations,
        packingItems,
        durationDays,
        totalDistanceKm,
        difficulty,
        visibility,
        plannerUrl,
        startLocation,
        endLocation,
        siteUrl: SITE_URL,
      });

      const blob = await pdf(<TripPdfDocument model={model} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugify(model.title)}-roadplan.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[export-pdf]", err);
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant={variant}
        size={size}
        className="text-base"
        onClick={() => void onExport()}
        disabled={pending || !canExport}
        aria-label={
          canExport ? "Export PDF itinerary" : "Add days before exporting"
        }
        {...tip(
          canExport ? "Export PDF itinerary" : "Add days before exporting",
        )}
      >
        <FileDown className="h-4 w-4" />
        <span className="hidden sm:inline">
          {pending ? "Exporting…" : "Export PDF"}
        </span>
        <span className="sm:hidden">{pending ? "…" : "PDF"}</span>
      </Button>
      {error ? (
        <p
          className="absolute right-0 top-full z-10 mt-1 w-52 rounded-lg border border-border bg-popover px-2 py-1 text-xs text-destructive shadow-elevated"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
