"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import { useAuthGate } from "@/components/auth/auth-gate-provider";
import { useSession } from "@/lib/auth-client";

export function GuestBanner() {
  const { data: session, isPending } = useSession();
  const { requireAuth } = useAuthGate();
  const [dismissed, setDismissed] = useState(false);

  if (isPending || session || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden border-b border-accent/30 bg-secondary"
      >
        <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3.5 sm:items-center sm:px-6">
          <div className="min-w-0 flex-1 text-base leading-snug sm:text-lg">
            <span className="font-medium">You&apos;re planning as a guest</span>
            <span className="text-muted-foreground">
              {" "}
              — sign in to save on all devices and share with tripmates.
            </span>{" "}
            <button
              type="button"
              onClick={() => requireAuth("save")}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create a free account
            </button>
            <span className="text-muted-foreground"> or </span>
            <Link
              href="/auth/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              sign in
            </Link>
            .
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-background/60 hover:text-foreground"
            aria-label="Dismiss guest banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
