"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Moon, Settings2, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useDisplayPrefs } from "@/lib/prefs/display-prefs";
import { cn } from "@/lib/utils/cn";

type Props = {
  tone?: "default" | "onDark";
  className?: string;
};

export function PreferencesMenu({ tone = "default", className }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const { timeFormat, setTimeFormat } = useDisplayPrefs();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const onDark = tone === "onDark";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Open preferences"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border backdrop-blur transition-colors",
          onDark
            ? "border-snow/25 bg-snow/10 text-snow hover:bg-snow/20"
            : "border-border bg-background/60 text-foreground hover:bg-secondary",
        )}
      >
        <Settings2 className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-popover p-3 shadow-elevated"
          >
            <p className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Preferences
            </p>

            <div className="mt-3 space-y-3">
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 px-1 text-sm font-medium text-popover-foreground">
                  {isDark ? (
                    <Sun className="size-3.5" />
                  ) : (
                    <Moon className="size-3.5" />
                  )}
                  Appearance
                </p>
                <div className="flex rounded-full border border-border bg-background p-0.5">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={!isDark}
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex-1 rounded-full px-3 py-1.5 text-sm font-medium leading-none",
                      !isDark
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={isDark}
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex-1 rounded-full px-3 py-1.5 text-sm font-medium leading-none",
                      isDark
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Dark
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-1.5 flex items-center gap-1.5 px-1 text-sm font-medium text-popover-foreground">
                  <Clock className="size-3.5" />
                  Time format
                </p>
                <div className="flex rounded-full border border-border bg-background p-0.5">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={timeFormat === "h12"}
                    onClick={() => setTimeFormat("h12")}
                    className={cn(
                      "flex-1 rounded-full px-3 py-1.5 text-sm font-medium leading-none",
                      timeFormat === "h12"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    AM/PM
                  </button>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={timeFormat === "h24"}
                    onClick={() => setTimeFormat("h24")}
                    className={cn(
                      "flex-1 rounded-full px-3 py-1.5 text-sm font-medium leading-none",
                      timeFormat === "h24"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    24h
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
