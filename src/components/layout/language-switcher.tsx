"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  defaultLocale,
  localeLabels,
  locales,
  localizedPath,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

export function LanguageSwitcher({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "onDark";
}) {
  const pathname = usePathname() || "/";
  const { locale, pathname: bare } = stripLocalePrefix(pathname);

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1", className)}
      role="navigation"
      aria-label="Language"
    >
      {locales.map((l) => {
        const href = localizedPath(l, bare);
        const active = l === locale;
        return (
          <Link
            key={l}
            href={href}
            hrefLang={l}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs tracking-wide transition-colors",
              tone === "onDark"
                ? active
                  ? "bg-snow/20 text-snow"
                  : "text-snow/65 hover:text-snow"
                : active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            {localeLabels[l]}
          </Link>
        );
      })}
    </div>
  );
}

export function useLocaleFromPath(): Locale {
  const pathname = usePathname() || "/";
  return stripLocalePrefix(pathname).locale || defaultLocale;
}
