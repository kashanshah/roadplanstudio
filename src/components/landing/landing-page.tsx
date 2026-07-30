"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Map, Route as RouteIcon, Share2 } from "lucide-react";
import { GuestBanner } from "@/components/layout/guest-banner";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";
import { useGuestTrip } from "@/lib/trips/guest-trip-provider";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const steps = [
  {
    icon: Map,
    title: "Drop the anchors",
    body: "Start with the places you refuse to miss. Everything else arranges itself around them.",
  },
  {
    icon: RouteIcon,
    title: "Pace the drive",
    body: "Live drive times, daylight windows and elevation so no day turns into eight hours of highway.",
  },
  {
    icon: Share2,
    title: "Share the plan",
    body: "Invite tripmates to comment, vote on stops and keep the itinerary honest while you travel.",
  },
];

export function LandingPage() {
  const router = useRouter();
  const { startPlanning } = useGuestTrip();
  const [pending, setPending] = useState(false);

  function onStartPlanning(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const form = new FormData(e.currentTarget);
    startPlanning({
      title: String(form.get("title") || "").trim() || undefined,
      startLocation: String(form.get("start") || "").trim() || undefined,
      endLocation: String(form.get("end") || "").trim() || undefined,
    });
    router.push("/planner/new");
  }

  return (
    <div className="min-h-screen bg-background text-[17px] leading-relaxed sm:text-lg">
      <GuestBanner />

      <section className="relative isolate min-h-[92svh] overflow-hidden">
        <Image
          src="/images/hero-road.jpg"
          alt="A winding mountain highway through misty Pacific Northwest spruce forest"
          fill
          priority
          className="absolute inset-0 -z-20 object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.174_0.012_175.5/0.72)_0%,oklch(0.174_0.012_175.5/0.55)_45%,oklch(0.174_0.012_175.5/0.94)_100%)]" />

        <SiteNav overlay />

        <div className="relative mx-auto flex min-h-[92svh] max-w-6xl flex-col justify-end px-4 pb-14 pt-32 sm:px-6 sm:pb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="eyebrow text-accent"
          >
            Pacific Northwest · Est. 2026
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-3xl font-display text-[clamp(3rem,10vw,6rem)] font-semibold leading-[0.95] tracking-tight text-snow"
          >
            RoadPlan Studio
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-lg leading-relaxed text-snow/80 sm:text-xl"
          >
            Plan the drive like a designer: real distances, honest daylight, and
            a map that finally matches the trip in your head.
          </motion.p>

          <motion.form
            onSubmit={onStartPlanning}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 w-full max-w-2xl space-y-3"
          >
            <input
              name="title"
              type="text"
              placeholder="Trip title (optional)"
              className="h-12 w-full rounded-full border border-snow/20 bg-snow/10 px-5 text-base text-snow placeholder:text-snow/45 outline-none backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-accent sm:text-lg"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="start"
                type="text"
                placeholder="From — e.g. Saskatoon"
                className="h-12 w-full rounded-full border border-snow/20 bg-snow/10 px-5 text-base text-snow placeholder:text-snow/45 outline-none backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-accent sm:text-lg"
              />
              <input
                name="end"
                type="text"
                placeholder="To — e.g. Banff"
                className="h-12 w-full rounded-full border border-snow/20 bg-snow/10 px-5 text-base text-snow placeholder:text-snow/45 outline-none backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-accent sm:text-lg"
              />
            </div>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <Button
                type="submit"
                size="lg"
                variant="accent"
                className="group text-base"
                disabled={pending}
              >
                {pending ? "Opening planner…" : "Start planning"}
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button asChild size="lg" variant="onDark" className="text-base">
                <Link href="/discover">
                  <Compass /> Discover trips
                </Link>
              </Button>
            </div>
            <p className="pt-1 text-base text-snow/65">
              No account needed to plan. Sign in later to save across devices and
              share with tripmates.
            </p>
          </motion.form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow text-primary">How it works</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Three moves between a vague idea and a trip you can actually drive.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.article
              key={s.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="py-2"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {s.body}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid overflow-hidden md:grid-cols-2 md:gap-10"
        >
          <div className="relative h-72 md:h-auto md:min-h-[400px]">
            <Image
              src="/images/trip-western-canada.jpg"
              alt="Turquoise glacier lake framed by snowy peaks in Western Canada"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center py-8 md:py-4">
            <p className="eyebrow text-primary">Featured trip</p>
            <h3 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Western Canada 2026
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Thirteen days from Saskatoon through Calgary, Banff, Jasper,
              Vancouver, Clearwater and Edmonton — a circular loop with lodging
              and attractions ready to remix.
            </p>
            <dl className="mt-8 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-3">
              {[
                ["Distance", "~4,200 km"],
                ["Days", "13"],
                ["Stops", "Seeded"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-sm tracking-widest text-muted-foreground uppercase">
                    {k}
                  </dt>
                  <dd className="mt-1 font-display text-xl font-semibold sm:text-2xl">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <Button asChild className="group mt-8 w-fit text-base" size="lg">
              <Link href="/trips/western-canada-2026">
                Open the itinerary
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-6xl gradient-dawn rounded-3xl px-6 py-16 text-center sm:px-12 sm:py-20"
        >
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold tracking-tight text-snow sm:text-5xl">
            Your next drive deserves better than a spreadsheet.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-snow/75">
            Start as a guest. Save it to the cloud when it starts feeling real.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="accent" className="text-base">
              <Link href="/planner/new">Start planning</Link>
            </Button>
            <Button asChild size="lg" variant="onDark" className="text-base">
              <Link href="/discover">Discover trips</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}
