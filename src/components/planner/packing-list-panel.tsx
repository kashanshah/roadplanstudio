"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Luggage, Plus, Trash2, X } from "lucide-react";
import type { PlannerPackingItem } from "@/components/planner/planner-types";
import { tip } from "@/components/ui/app-tooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  items: PlannerPackingItem[];
  isEditor: boolean;
  onAdd: (label: string) => Promise<void> | void;
  onToggle: (id: string, packed: boolean) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onSeedDefaults?: () => Promise<void> | void;
};

export function PackingListPanel({
  open,
  onClose,
  items,
  isEditor,
  onAdd,
  onToggle,
  onDelete,
  onSeedDefaults,
}: Props) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
    [items],
  );
  const packedCount = sorted.filter((i) => i.packed).length;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const label = draft.trim();
    if (!label || !isEditor || pending) return;
    setPending(true);
    try {
      await onAdd(label);
      setDraft("");
    } finally {
      setPending(false);
    }
  }

  if (!open) return null;
  if (!isEditor && sorted.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end">
      <button
        type="button"
        aria-label="Close packing list"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="packing-sheet-title"
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-elevated",
          "sm:my-3 sm:mr-3 sm:max-h-[calc(100vh-1.5rem)] sm:w-[min(100%,400px)] sm:rounded-3xl",
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Luggage className="size-3.5" />
              Checklist
            </p>
            <h2
              id="packing-sheet-title"
              className="mt-1 font-display text-2xl font-semibold tracking-tight"
            >
              Packing list
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {sorted.length
                ? `${packedCount} of ${sorted.length} packed`
                : "Keep gear and docs in one place for the road."}
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
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {isEditor && sorted.length === 0 && onSeedDefaults ? (
            <div className="mb-4 rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-4">
              <p className="text-sm text-muted-foreground">
                Start from a ready-made road-trip list, or add your own items
                below.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-3"
                disabled={pending}
                onClick={() => {
                  setPending(true);
                  void Promise.resolve(onSeedDefaults()).finally(() =>
                    setPending(false),
                  );
                }}
              >
                Use starter list
              </Button>
            </div>
          ) : null}

          {sorted.length === 0 ? (
            <p className="text-base text-muted-foreground">
              Add items for the car — docs, chargers, layers. They sync into the
              PDF export.
            </p>
          ) : (
            <ul className="space-y-1">
              {sorted.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-start gap-3 rounded-xl px-1 py-2 hover:bg-secondary/50"
                >
                  <Checkbox
                    checked={item.packed}
                    disabled={!isEditor || pending}
                    onCheckedChange={(v) => {
                      void onToggle(item.id, v === true);
                    }}
                    aria-label={`Packed: ${item.label}`}
                    className="mt-0.5"
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 text-base leading-snug",
                      item.packed && "text-muted-foreground line-through",
                    )}
                  >
                    {item.category ? (
                      <span className="mr-2 text-xs tracking-wide text-muted-foreground uppercase">
                        {item.category}
                      </span>
                    ) : null}
                    {item.label}
                  </span>
                  {isEditor ? (
                    <button
                      type="button"
                      aria-label={`Remove ${item.label}`}
                      {...tip("Remove item")}
                      className="rounded-lg p-1.5 text-muted-foreground opacity-70 transition hover:bg-background hover:text-destructive group-hover:opacity-100"
                      disabled={pending}
                      onClick={() => void onDelete(item.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        {isEditor ? (
          <form
            onSubmit={submit}
            className="shrink-0 border-t border-border px-4 py-3 sm:px-5"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a packing item…"
                maxLength={200}
                className="h-11 w-full flex-1 rounded-full border border-input bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button
                type="submit"
                size="sm"
                disabled={pending || !draft.trim()}
                className="shrink-0"
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
          </form>
        ) : null}
      </aside>
    </div>
  );
}
