"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";
import { AccountMenu } from "@/components/auth/account-menu";
import { Wordmark } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useSession } from "@/lib/auth-client";
import {
  localizedPath,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";

function useNavLocale(): Locale {
  const pathname = usePathname() || "/";
  return stripLocalePrefix(pathname).locale;
}

export function SiteNav({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const locale = useNavLocale();
  const dict = getDictionary(locale);
  const { data: session } = useSession();
  const { pathname: bare } = stripLocalePrefix(pathname);

  const publicLinks = [
    { href: localizedPath(locale, "/"), label: dict.nav.home, match: "/" },
    {
      href: localizedPath(locale, "/discover"),
      label: dict.nav.discover,
      match: "/discover",
    },
    {
      href: localizedPath(locale, "/destinations"),
      label: dict.nav.destinations,
      match: "/destinations",
    },
    {
      href: localizedPath(locale, "/blog"),
      label: dict.nav.blog,
      match: "/blog",
    },
  ] as const;

  const mobileLinks = [
    ...publicLinks,
    {
      href: localizedPath(locale, "/features"),
      label: dict.nav.features,
      match: "/features",
    },
    {
      href: localizedPath(locale, "/pricing"),
      label: dict.nav.pricing,
      match: "/pricing",
    },
    {
      href: localizedPath(locale, "/contact"),
      label: dict.nav.contact,
      match: "/contact",
    },
    session
      ? { href: "/account", label: dict.nav.account, match: "/account" }
      : {
          href: "/auth/login",
          label: dict.nav.signIn,
          match: "/auth/login",
        },
    ...(session
      ? [{ href: "/planner", label: dict.nav.planner, match: "/planner" }]
      : []),
  ];

  function isActive(match: string) {
    if (match === "/") return bare === "/";
    return bare === match || bare.startsWith(`${match}/`);
  }

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-40"
          : "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl"
      }
    >
      <nav className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-6">
        <Link href={localizedPath(locale, "/")} className="min-w-0">
          <Wordmark
            size="sm"
            className={overlay ? "text-snow [&_span]:text-snow/70" : ""}
          />
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 lg:flex">
            {publicLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm transition-colors",
                  overlay
                    ? isActive(l.match)
                      ? "text-snow"
                      : "text-snow/75 hover:text-snow"
                    : isActive(l.match)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            ))}
            {session ? (
              <Link
                href="/planner"
                className={cn(
                  "rounded-full px-3 py-2 text-sm transition-colors",
                  overlay
                    ? "text-snow/75 hover:text-snow"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {dict.nav.planner}
              </Link>
            ) : null}
          </div>
          <LanguageSwitcher
            className="hidden xl:flex"
            tone={overlay ? "onDark" : "default"}
          />
          <ThemeToggle
            className={overlay ? "border-snow/25 bg-snow/10 text-snow" : ""}
          />
          <AccountMenu
            tone={overlay ? "onDark" : "default"}
            className="hidden sm:block"
          />
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full border border-border lg:hidden",
              overlay ? "border-snow/25 text-snow" : "text-foreground",
            )}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 rounded-2xl border border-border bg-popover p-2 shadow-elevated lg:hidden"
        >
          {mobileLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm text-popover-foreground transition-colors hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t border-border px-3 py-3">
            <LanguageSwitcher />
          </div>
          {session ? (
            <Link
              href="/account/sessions"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm text-destructive transition-colors hover:bg-secondary"
            >
              Log out
            </Link>
          ) : null}
        </motion.div>
      ) : null}
    </motion.header>
  );
}

export function SiteFooter() {
  const { data: session } = useSession();
  const locale = useNavLocale();
  const dict = getDictionary(locale);

  const columns = [
    {
      title: dict.footer.product,
      links: [
        { href: localizedPath(locale, "/discover"), label: dict.nav.discover },
        {
          href: localizedPath(locale, "/destinations"),
          label: dict.nav.destinations,
        },
        { href: localizedPath(locale, "/features"), label: dict.nav.features },
        { href: localizedPath(locale, "/pricing"), label: dict.nav.pricing },
        {
          href: localizedPath(locale, "/request-feature"),
          label: dict.nav.requestFeature,
        },
      ],
    },
    {
      title: dict.footer.company,
      links: [
        { href: localizedPath(locale, "/about"), label: dict.nav.about },
        { href: localizedPath(locale, "/blog"), label: dict.nav.blog },
        { href: localizedPath(locale, "/contact"), label: dict.nav.contact },
        session
          ? { href: "/account", label: dict.nav.account }
          : { href: "/auth/login", label: dict.nav.signIn },
      ],
    },
    {
      title: dict.footer.legal,
      links: [
        { href: localizedPath(locale, "/privacy"), label: dict.footer.privacy },
        { href: localizedPath(locale, "/terms"), label: dict.footer.terms },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div className="min-w-0">
            <Wordmark size="sm" />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {dict.footer.tagline}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {dict.footer.language}
            </p>
            <LanguageSwitcher className="mt-2" />
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-medium tracking-wide text-foreground">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} RoadPlan Studio · www.roadplanstudio.com
        </p>
      </div>
    </footer>
  );
}
