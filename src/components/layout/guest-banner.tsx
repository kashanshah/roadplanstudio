"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CloudUpload, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function GuestBanner({
  sticky = true,
  className,
}: {
  sticky?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            sticky ? "sticky top-0 z-50" : "",
            "overflow-hidden border-b border-border bg-spruce text-snow",
            className,
          )}
        >
          <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 sm:flex sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/25 text-map-route">
                <CloudUpload className="h-3.5 w-3.5" />
              </span>
              <p className="min-w-0 text-sm">
                <span className="font-medium">
                  You&apos;re planning as a guest
                </span>
                <span className="hidden text-snow/70 sm:inline">
                  {" "}
                  — sign up to save &amp; share your trip.
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button asChild size="sm" variant="accent" className="h-8 px-3 text-xs">
                <Link href="/auth/register">Save my trip</Link>
              </Button>
              <button
                type="button"
                aria-label="Dismiss guest banner"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-snow/60 transition-colors hover:bg-snow/10 hover:text-snow"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
