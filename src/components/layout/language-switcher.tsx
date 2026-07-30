"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Globe } from "lucide-react";
import {
  defaultLocale,
  localeLabels,
  locales,
  localizedPath,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

type Props = {
  tone?: "default" | "onDark";
  className?: string;
  /** Dropdown panel alignment relative to the trigger. */
  align?: "start" | "end";
};

export function LanguageSwitcher({
  className,
  tone = "default",
  align = "end",
}: Props) {
  const pathname = usePathname() || "/";
  const { locale, pathname: bare } = stripLocalePrefix(pathname);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  // Close when the route/locale changes after a selection.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const onDark = tone === "onDark";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={`Language: ${localeLabels[locale]}`}
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
        <Globe className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            aria-label="Language"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-popover p-3 shadow-elevated",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            <p className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Language
            </p>
            <div className="mt-3 space-y-1">
              {locales.map((l) => {
                const href = localizedPath(l, bare);
                const active = l === locale;
                return (
                  <Link
                    key={l}
                    href={href}
                    hrefLang={l}
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-popover-foreground hover:bg-secondary",
                    )}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="font-medium leading-none">
                        {localeLabels[l]}
                      </span>
                      <span
                        className={cn(
                          "mt-1 text-xs uppercase tracking-wide",
                          active
                            ? "text-primary-foreground/75"
                            : "text-muted-foreground",
                        )}
                      >
                        {l}
                      </span>
                    </span>
                    {active ? <Check className="size-4 shrink-0" /> : null}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function useLocaleFromPath(): Locale {
  const pathname = usePathname() || "/";
  return stripLocalePrefix(pathname).locale || defaultLocale;
}
