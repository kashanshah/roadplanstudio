"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { PreferencesMenu } from "@/components/layout/preferences-menu";
import { tip } from "@/components/ui/app-tooltip";
import { Button } from "@/components/ui/button";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  quote = "Thirteen days around Western Canada — one deliberate loop.",
  wide = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  quote?: string;
  /** Wider content column for invite previews with itineraries. */
  wide?: boolean;
}) {
  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
      <div className="flex min-h-svh flex-col px-5 py-6 sm:px-8 lg:px-14">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <Link href="/" className="min-w-0">
            <Wordmark size="sm" />
          </Link>
          <PreferencesMenu />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={
            wide
              ? "mx-auto flex w-full max-w-2xl flex-1 flex-col justify-start py-10"
              : "mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10"
          }
        >
          <p className="eyebrow text-primary">{eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-8">{children}</div>
        </motion.div>

        <div
          className={
            wide
              ? "mx-auto w-full max-w-2xl text-xs text-muted-foreground"
              : "mx-auto w-full max-w-sm text-xs text-muted-foreground"
          }
        >
          {footer ?? (
            <span>
              Prefer not to sign up yet?{" "}
              <Link
                href="/planner/new"
                className="text-primary underline-offset-4 hover:underline"
              >
                Keep planning as a guest
              </Link>
            </span>
          )}
        </div>
      </div>

      {/* Viewport-tall sticky panel — do not stretch with tall left content */}
      <aside className="relative hidden h-svh overflow-hidden lg:sticky lg:top-0 lg:block">
        <Image
          src="/images/hero-road.jpg"
          alt="Mountain highway winding through spruce forest"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(200deg,oklch(0.174_0.012_175.5/0.55)_0%,oklch(0.174_0.012_175.5/0.9)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="font-display text-3xl font-semibold leading-tight text-snow">
            {quote}
          </p>
          <p className="mt-4 text-sm text-snow/60">
            Western Canada 2026 · a RoadPlan Studio trip
          </p>
        </div>
      </aside>
    </div>
  );
}

export function SocialButtons() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {["Google", "Apple"].map((label) => (
        <Button
          key={label}
          type="button"
          variant="outline"
          className="w-full justify-center"
          disabled
          aria-label={`${label} sign-in coming soon`}
          {...tip("Coming soon")}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

export function Divider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
