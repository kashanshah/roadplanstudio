"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80')] bg-cover bg-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-ink/55 via-spruce/65 to-ink/85"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(11,18,16,0.35)_70%)]"
        />

        <SiteHeader />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.12 }}
            className="max-w-2xl"
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="font-display text-4xl font-semibold tracking-tight text-snow sm:text-6xl md:text-7xl"
            >
              RoadPlan Studio
            </motion.p>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="mt-4 max-w-xl text-lg text-snow/85 sm:text-xl"
            >
              Map the days. Drag the stops. Share the road.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="mt-3 max-w-lg text-sm text-snow/70 sm:text-base"
            >
              A premium multi-day trip canvas for routes, lodging, and
              tripmates — built for the open road.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href="/planner/new"
                className="inline-flex items-center justify-center rounded-md bg-sandstone px-5 py-3 text-sm font-medium text-spruce transition hover:bg-sandstone/90"
              >
                Start planning
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center justify-center rounded-md border border-snow/30 bg-snow/10 px-5 py-3 text-sm font-medium text-snow backdrop-blur transition hover:bg-snow/20"
              >
                Discover trips
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border bg-background px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Build a full itinerary in minutes — as a guest or synced to the
            cloud.
          </p>
          <ol className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Sketch the loop",
                body: "Add days and drop stops on a live map with real place data.",
              },
              {
                step: "02",
                title: "Reorder the road",
                body: "Drag stops across days — routes and timing update instantly.",
              },
              {
                step: "03",
                title: "Invite tripmates",
                body: "Share privately or publish. Editors collaborate in real time.",
              },
            ].map((item) => (
              <li key={item.step}>
                <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
                  {item.step}
                </p>
                <h3 className="mt-3 font-display text-xl text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
            Featured itinerary
          </p>
          <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">
            Western Canada Road Trip 2026
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A 13-day circular loop: Saskatoon → Calgary → Banff → Jasper →
            Vancouver → Clearwater → Edmonton → Saskatoon.
          </p>
          <Link
            href="/trips/western-canada-2026"
            className="mt-8 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Explore the template
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-spruce px-4 py-20 text-snow sm:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl">
            Ready for the next stretch?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-snow/70">
            Start as a guest. Save to the cloud when you&apos;re ready to share.
          </p>
          <Link
            href="/planner/new"
            className="mt-8 inline-flex rounded-md bg-sandstone px-5 py-3 text-sm font-medium text-spruce transition hover:bg-sandstone/90"
          >
            Open the planner
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} RoadPlan Studio ·{" "}
        <a
          href="https://www.roadplanstudio.com"
          className="underline-offset-4 hover:underline"
        >
          roadplanstudio.com
        </a>
      </footer>
    </div>
  );
}
