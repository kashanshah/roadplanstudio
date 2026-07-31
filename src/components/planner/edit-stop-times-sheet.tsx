"use client";

import { useEffect, useState } from "react";
import { Clock, X } from "lucide-react";
import { tip } from "@/components/ui/app-tooltip";
import { Button } from "@/components/ui/button";
import { formatDurationLabel } from "@/components/planner/use-day-timeline";
import type { PlannerItem } from "@/components/planner/planner-types";
import {
  buildStopTimePatch,
  dayOffsetFromMins,
  minsToTimeInput,
  resolveDepartAfterArrive,
  timeInputToMins,
} from "@/lib/trips/stop-time";
import { cn } from "@/lib/utils/cn";

type TimePatch = Partial<
  Pick<PlannerItem, "durationMins" | "timingMode" | "timingMins" | "type">
>;

type Props = {
  open: boolean;
  onClose: () => void;
  stopName: string;
  arriveMins: number;
  departMins: number;
  isFirstStop: boolean;
  /** Hotel (non–trip-start) can clear overnight lodging. */
  canEditOvernight?: boolean;
  canEditTimes?: boolean;
  onUpdate: (patch: TimePatch) => Promise<void> | void;
};

/**
 * Dedicated sheet for editing stop schedule (and overnight flag).
 * Save applies and closes; Cancel discards drafts.
 */
export function EditStopTimesSheet({
  open,
  onClose,
  stopName,
  arriveMins,
  departMins,
  isFirstStop,
  canEditOvernight = false,
  canEditTimes = true,
  onUpdate,
}: Props) {
  const [arriveDraft, setArriveDraft] = useState("");
  const [departDraft, setDepartDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setArriveDraft(minsToTimeInput(arriveMins));
    setDepartDraft(minsToTimeInput(departMins));
    setTimeError(null);
  }, [open, arriveMins, departMins]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const arriveDayOffset = dayOffsetFromMins(arriveMins);
  const departDayOffset = dayOffsetFromMins(departMins);

  const draftDepartWall = timeInputToMins(departDraft);
  const draftArriveContinuous = isFirstStop ? draftDepartWall : arriveMins;
  const draftDepartContinuous =
    draftArriveContinuous != null && draftDepartWall != null
      ? isFirstStop
        ? draftDepartWall
        : resolveDepartAfterArrive(draftArriveContinuous, draftDepartWall)
      : null;
  const draftStayMins =
    draftArriveContinuous != null && draftDepartContinuous != null
      ? Math.max(0, draftDepartContinuous - draftArriveContinuous)
      : null;

  async function saveTimes() {
    if (!canEditTimes) return;
    const departWall = timeInputToMins(departDraft);
    if (departWall == null) {
      setTimeError("Enter a valid time.");
      return;
    }

    const nextArrive = isFirstStop ? departWall : arriveMins;
    const nextDepart = isFirstStop
      ? departWall
      : resolveDepartAfterArrive(nextArrive, departWall);

    setSaving(true);
    setTimeError(null);
    try {
      await onUpdate(
        buildStopTimePatch({
          arriveMins: nextArrive,
          departMins: nextDepart,
          isFirstStop,
        }),
      );
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center pt-[env(safe-area-inset-top)] sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close edit times"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-times-title"
        className={cn(
          "relative z-10 flex max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top)))] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-elevated",
          "sm:max-h-[min(85dvh,560px)] sm:max-w-md sm:rounded-3xl",
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-primary">
              <Clock className="size-3.5" />
              Schedule
            </p>
            <h2
              id="edit-times-title"
              className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl"
            >
              Edit times
            </h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {stopName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close"
            {...tip("Close")}
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {canEditOvernight ? (
            <div className="space-y-2 rounded-xl border border-border bg-background/80 p-3">
              <p className="text-sm font-medium text-foreground">Overnight</p>
              <p className="text-sm text-muted-foreground">
                Keep the place but stop treating it as lodging, or delete the
                stop from the itinerary.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => void onUpdate({ type: "attraction" })}
              >
                Remove overnight
              </Button>
            </div>
          ) : null}

          {canEditTimes ? (
            <div className="space-y-3">
              <div
                className={cn("grid gap-3", !isFirstStop && "sm:grid-cols-2")}
              >
                {!isFirstStop ? (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
                      Arrive
                      <span className="font-normal">
                        {" "}
                        · from previous stop
                        {arriveDayOffset > 0 ? " · next day" : ""}
                      </span>
                    </span>
                    <input
                      type="time"
                      value={arriveDraft}
                      disabled
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                  </label>
                ) : null}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
                    Depart
                    {departDayOffset > 0 ||
                    (draftDepartContinuous != null &&
                      dayOffsetFromMins(draftDepartContinuous) > 0) ? (
                      <span className="font-normal"> · next day</span>
                    ) : null}
                  </span>
                  <input
                    type="time"
                    value={departDraft}
                    onChange={(e) => setDepartDraft(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>
              {!isFirstStop ? (
                <p className="text-sm text-muted-foreground">
                  Stay{" "}
                  <span className="font-medium text-foreground">
                    {draftStayMins != null
                      ? formatDurationLabel(draftStayMins)
                      : "—"}
                  </span>{" "}
                  (auto)
                  {arriveDayOffset > 0 ? (
                    <span>
                      . Overnight arrivals keep the next-day offset when you
                      save depart.
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Morning start — set when you leave this stop.
                </p>
              )}
              {timeError ? (
                <p className="text-sm text-destructive" role="alert">
                  {timeError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <footer className="flex shrink-0 flex-wrap gap-2 border-t border-border px-4 py-3 sm:px-5">
          {canEditTimes ? (
            <Button
              type="button"
              className="min-w-[6.5rem]"
              disabled={saving}
              onClick={() => void saveTimes()}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
        </footer>
      </div>
    </div>
  );
}
