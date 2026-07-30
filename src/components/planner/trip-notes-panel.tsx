"use client";

import { useEffect, useState } from "react";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Props = {
  notes: string | null | undefined;
  isEditor: boolean;
  onSave: (notes: string | null) => Promise<void> | void;
  className?: string;
};

export function TripNotesPanel({
  notes,
  isEditor,
  onSave,
  className,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(notes ?? "");
  }, [notes, editing]);

  const trimmed = notes?.trim() || "";

  async function commit() {
    const next = draft.trim() || null;
    if (next === (trimmed || null)) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(next);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!isEditor && !trimmed) return null;

  if (!editing) {
    return (
      <div
        className={cn(
          "mb-4 rounded-2xl border border-border bg-card/60 px-4 py-3 sm:px-5 sm:py-4",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <NotebookPen className="size-3.5 shrink-0" />
            Trip notes
          </p>
          {isEditor ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="shrink-0"
              onClick={() => setEditing(true)}
            >
              {trimmed ? "Edit" : "Add"}
            </Button>
          ) : null}
        </div>
        {trimmed ? (
          <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
            {trimmed}
          </p>
        ) : (
          <p className="mt-2 text-base text-muted-foreground">
            Packing reminders, border docs, group agreements…
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-4 rounded-2xl border border-border bg-card px-4 py-3 sm:px-5 sm:py-4",
        className,
      )}
    >
      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <NotebookPen className="size-3.5" />
          Trip notes
        </span>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          maxLength={5000}
          autoFocus
          placeholder="Packing reminders, border docs, group agreements…"
          className="mt-1 w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={saving}
          onClick={() => void commit()}
        >
          {saving ? "Saving…" : "Save notes"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={saving}
          onClick={() => {
            setDraft(notes ?? "");
            setEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
