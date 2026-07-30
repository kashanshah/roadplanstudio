"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";
import { AccountMenu } from "@/components/auth/account-menu";
import { Wordmark } from "@/components/brand/logo";
import { PreferencesMenu } from "@/components/layout/preferences-menu";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils/cn";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/emails", label: "Emails" },
] as const;

export function SiteNav({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const mobileLinks = [
    ...publicLinks,
    session
      ? { href: "/account", label: "Account" }
      : { href: "/auth/login", label: "Sign in" },
    ...(session ? [{ href: "/planner", label: "Planner" }] : []),
  ];

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
        <Link href="/" className="min-w-0">
          <Wordmark
            size="sm"
            className={overlay ? "text-snow [&_span]:text-snow/70" : ""}
          />
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 md:flex">
            {publicLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm transition-colors",
                  overlay
                    ? pathname === l.href
                      ? "text-snow"
                      : "text-snow/75 hover:text-snow"
                    : pathname === l.href
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
                Planner
              </Link>
            ) : null}
          </div>
          <PreferencesMenu tone={overlay ? "onDark" : "default"} />
          <AccountMenu
            tone={overlay ? "onDark" : "default"}
            className="hidden sm:block"
          />
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full border border-border md:hidden",
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
          className="mx-4 mb-4 rounded-2xl border border-border bg-popover p-2 shadow-elevated md:hidden"
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

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <Wordmark size="sm" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Road trip planning for people who care how the route feels, not just
            how long it takes.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/discover" className="transition-colors hover:text-foreground">
            Discover
          </Link>
          <Link href="/emails" className="transition-colors hover:text-foreground">
            Emails
          </Link>
          {session ? (
            <Link
              href="/account"
              className="transition-colors hover:text-foreground"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          )}
          <span>www.roadplanstudio.com</span>
        </div>
      </div>
    </footer>
  );
}
