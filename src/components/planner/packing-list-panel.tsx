"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Luggage, Plus, Trash2 } from "lucide-react";
import type { PlannerPackingItem } from "@/components/planner/planner-types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils/cn";

type Props = {
  items: PlannerPackingItem[];
  isEditor: boolean;
  onAdd: (label: string) => Promise<void> | void;
  onToggle: (id: string, packed: boolean) => Promise<void> | void;
  onRename?: (id: string, label: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onSeedDefaults?: () => Promise<void> | void;
  className?: string;
};

export function PackingListPanel({
  items,
  isEditor,
  onAdd,
  onToggle,
  onDelete,
  onSeedDefaults,
  className,
}: Props) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
    [items],
  );
  const packedCount = sorted.filter((i) => i.packed).length;

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

  if (!isEditor && sorted.length === 0) return null;

  return (
    <div
      className={cn(
        "mb-4 rounded-2xl border border-border bg-card/60 px-4 py-3 sm:px-5 sm:py-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="flex min-w-0 items-center gap-1.5 text-left text-sm font-medium text-muted-foreground"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
        >
          <Luggage className="size-3.5 shrink-0" />
          <span>Packing list</span>
          {sorted.length ? (
            <span className="text-muted-foreground/80">
              · {packedCount}/{sorted.length}
            </span>
          ) : null}
        </button>
        <div className="flex shrink-0 items-center gap-1">
          {isEditor && sorted.length === 0 && onSeedDefaults ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
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
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? "Show" : "Hide"}
          </Button>
        </div>
      </div>

      {!collapsed ? (
        <div className="mt-3 space-y-2">
          {sorted.length === 0 ? (
            <p className="text-base text-muted-foreground">
              Add items for the car — docs, chargers, layers. They sync into the
              PDF export.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {sorted.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-start gap-3 rounded-xl px-1 py-1.5 hover:bg-secondary/50"
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

          {isEditor ? (
            <form
              onSubmit={submit}
              className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center"
            >
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
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
