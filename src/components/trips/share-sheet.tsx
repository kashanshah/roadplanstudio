"use client";

import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { tip } from "@/components/ui/app-tooltip";
import { Button } from "@/components/ui/button";

type Props = {
  tripId: string;
  onClose: () => void;
};

export function ShareSheet({ tripId, onClose }: Props) {
  const [visibility, setVisibility] = useState<
    "private" | "unlisted" | "public"
  >("private");
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/planner/${tripId}`
      : `/planner/${tripId}`;

  async function saveVisibility(next: typeof visibility) {
    setVisibility(next);
    setPending(true);
    setError(null);
    const res = await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility: next }),
    });
    setPending(false);
    if (!res.ok) {
      setError("Could not update visibility");
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ink/55">
      <button
        type="button"
        className="fixed inset-0"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative flex min-h-full items-end justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center">
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-6 pt-14 shadow-elevated sm:p-8 sm:pt-14">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Close"
            {...tip("Close")}
          >
            <X className="h-5 w-5" />
          </button>
          <p className="eyebrow text-primary">Share</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">
            Share this trip
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Choose who can open the plan. Unlisted is link-only; Public is SEO
            indexable.
          </p>

          <div className="mt-6 space-y-2">
            {(
              [
                ["private", "Private", "Only you and invited tripmates"],
                ["unlisted", "Unlisted", "Anyone with the link"],
                ["public", "Public", "Discoverable and indexable"],
              ] as const
            ).map(([value, label, hint]) => (
              <button
                key={value}
                type="button"
                disabled={pending}
                onClick={() => saveVisibility(value)}
                className={`flex w-full flex-col rounded-2xl border px-4 py-3 text-left transition ${
                  visibility === value
                    ? "border-primary bg-secondary"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <span className="text-base font-medium">{label}</span>
                <span className="text-sm text-muted-foreground">{hint}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={shareUrl}
              className="h-12 min-w-0 w-full flex-1 truncate rounded-full border border-input bg-background px-4 text-sm"
            />
            <Button
              type="button"
              onClick={copyLink}
              className="w-full shrink-0 sm:w-auto"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          {error ? (
            <p className="mt-3 text-base text-destructive">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
