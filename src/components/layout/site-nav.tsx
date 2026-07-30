"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";
import { AccountMenu } from "@/components/auth/account-menu";
import { Wordmark } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { PreferencesMenu } from "@/components/layout/preferences-menu";
import { SitePreFooter } from "@/components/layout/site-pre-footer";
import { tip } from "@/components/ui/app-tooltip";
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
          <LanguageSwitcher tone={overlay ? "onDark" : "default"} />
          <PreferencesMenu tone={overlay ? "onDark" : "default"} />
          <AccountMenu
            tone={overlay ? "onDark" : "default"}
            className="hidden sm:block"
          />
          <button
            type="button"
            aria-label="Open menu"
            {...tip("Menu")}
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
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-50 mx-4 mb-4 rounded-2xl border border-border bg-popover p-2 shadow-elevated lg:hidden"
          >
            {mobileLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-base text-popover-foreground transition-colors hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-3">
              <span className="text-sm text-muted-foreground">
                {dict.footer.language}
              </span>
              <LanguageSwitcher align="end" />
            </div>
            {session ? (
              <Link
                href="/account/sessions"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-base text-destructive transition-colors hover:bg-secondary"
              >
                Log out
              </Link>
            ) : null}
          </motion.div>
        </>
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
        { href: localizedPath(locale, "/features"), label: dict.nav.features },
        { href: localizedPath(locale, "/pricing"), label: dict.nav.pricing },
        { href: "/planner/new", label: dict.common.startPlanning },
        {
          href: localizedPath(locale, "/request-feature"),
          label: dict.nav.requestFeature,
        },
      ],
    },
    {
      title: dict.footer.explore,
      links: [
        {
          href: localizedPath(locale, "/destinations"),
          label: dict.nav.destinations,
        },
        {
          href: localizedPath(locale, "/destinations/europe"),
          label: "Europe",
        },
        {
          href: localizedPath(locale, "/destinations/north-america"),
          label: "North America",
        },
        {
          href: localizedPath(locale, "/trips/western-canada-2026"),
          label: "Western Canada 2026",
        },
        {
          href: localizedPath(locale, "/trips/iceland-ring-road"),
          label: "Iceland Ring Road",
        },
        { href: localizedPath(locale, "/blog"), label: dict.nav.blog },
      ],
    },
    {
      title: dict.footer.company,
      links: [
        { href: localizedPath(locale, "/about"), label: dict.nav.about },
        { href: localizedPath(locale, "/contact"), label: dict.nav.contact },
        session
          ? { href: "/account", label: dict.nav.account }
          : { href: "/auth/login", label: dict.nav.signIn },
        ...(session ? [{ href: "/planner", label: dict.nav.planner }] : []),
      ],
    },
    {
      title: dict.footer.legal,
      links: [
        { href: localizedPath(locale, "/legal"), label: dict.footer.legal },
        { href: localizedPath(locale, "/terms"), label: dict.footer.terms },
        { href: localizedPath(locale, "/privacy"), label: dict.footer.privacy },
        { href: localizedPath(locale, "/cookies"), label: dict.footer.cookies },
        {
          href: localizedPath(locale, "/acceptable-use"),
          label: dict.footer.acceptableUse,
        },
        {
          href: localizedPath(locale, "/copyright"),
          label: dict.footer.copyright,
        },
        { href: "/sitemap.xml", label: dict.footer.sitemap },
      ],
    },
  ];

  return (
    <>
      <SitePreFooter locale={locale} />
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_repeat(4,minmax(0,1fr))]">
            <div className="min-w-0">
              <Wordmark size="sm" />
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {dict.footer.tagline}
              </p>
              <p className="mt-5 text-sm text-muted-foreground">
                <Link
                  href={localizedPath(locale, "/contact")}
                  className="transition-colors hover:text-foreground"
                >
                  hello@roadplanstudio.com
                </Link>
              </p>
              <div className="mt-5 flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {dict.footer.language}
                </p>
                <LanguageSwitcher align="start" />
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-medium tracking-wide text-foreground">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {col.links.map((l) => (
                    <li key={`${col.title}-${l.href}-${l.label}`}>
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

          <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} RoadPlan Studio. {dict.footer.rights}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link
                href={localizedPath(locale, "/privacy")}
                className="transition-colors hover:text-foreground"
              >
                {dict.footer.privacy}
              </Link>
              <Link
                href={localizedPath(locale, "/terms")}
                className="transition-colors hover:text-foreground"
              >
                {dict.footer.terms}
              </Link>
              <Link
                href={localizedPath(locale, "/cookies")}
                className="transition-colors hover:text-foreground"
              >
                {dict.footer.cookies}
              </Link>
              <span>www.roadplanstudio.com</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
