"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, Route } from "lucide-react";
import { TemplatePickerModal } from "@/components/planner/template-picker-modal";
import { Button } from "@/components/ui/button";

type Props = {
  compact?: boolean;
};

export function TemplateStrip({ compact }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section
        className={
          compact
            ? "rounded-2xl border border-border bg-card/80 p-4"
            : "rounded-2xl border border-border bg-card p-5"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
              Start from a base trip
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold sm:text-2xl">
              Choose a template when needed
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No template is preloaded by default.
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            <Compass className="size-3.5" />
            Discover
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <Route className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold">Open template picker</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a base trip only if you want to remix one.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            className="mt-4 text-base"
            onClick={() => setModalOpen(true)}
          >
            Choose template
          </Button>
        </div>
      </section>
      <TemplatePickerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
