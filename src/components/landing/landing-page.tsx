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
import { tripTemplates } from "@/data/trips/templates";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useGuestTrip } from "@/lib/trips/guest-trip-provider";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function LandingPage({ locale = "en" }: { locale?: Locale }) {
  const router = useRouter();
  const { startPlanning } = useGuestTrip();
  const [pending, setPending] = useState(false);
  const dict = getDictionary(locale);
  const featured = tripTemplates.slice(0, 6);

  const steps = [
    {
      icon: Map,
      title: locale === "fr" ? "Posez les ancres" : locale === "es" ? "Fija los anclajes" : locale === "de" ? "Anker setzen" : locale === "ja" ? "拠点を置く" : "Drop the anchors",
      body:
        locale === "fr"
          ? "Commencez par les lieux incontournables. Le reste s’organise autour."
          : locale === "es"
            ? "Empieza por los lugares imprescindibles. El resto se ordena alrededor."
            : locale === "de"
              ? "Beginne mit den Orten, die du nicht verpassen willst."
              : locale === "ja"
                ? "外せない場所から。残りはその周りに収まる。"
                : "Start with the places you refuse to miss. Everything else arranges itself around them.",
    },
    {
      icon: RouteIcon,
      title: locale === "fr" ? "Rythmez la route" : locale === "es" ? "Marca el ritmo" : locale === "de" ? "Tempo setzen" : locale === "ja" ? "運転のペース" : "Pace the drive",
      body:
        locale === "en"
          ? "Live drive times, daylight windows and elevation so no day turns into eight hours of highway."
          : dict.home.howTitle,
    },
    {
      icon: Share2,
      title: locale === "fr" ? "Partagez le plan" : locale === "es" ? "Comparte el plan" : locale === "de" ? "Plan teilen" : locale === "ja" ? "計画を共有" : "Share the plan",
      body:
        locale === "en"
          ? "Invite tripmates to comment, vote on stops and keep the itinerary honest while you travel."
          : "Tripmates · VIEWER / EDITOR",
    },
  ];

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
            {dict.home.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-3xl font-display text-[clamp(3rem,10vw,6rem)] font-semibold leading-[0.95] tracking-tight text-snow"
          >
            {dict.home.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-lg leading-relaxed text-snow/80 sm:text-xl"
          >
            {dict.home.subhead}
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
                {pending ? "…" : dict.common.startPlanning}
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button asChild size="lg" variant="onDark" className="text-base">
                <Link href={localizedPath(locale, "/discover")}>
                  <Compass /> {dict.common.discoverTrips}
                </Link>
              </Button>
            </div>
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
          <p className="eyebrow text-primary">{dict.home.howBody}</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {dict.home.howTitle}
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
        >
          <p className="eyebrow text-primary">{dict.nav.discover}</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {dict.discover.title}
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((trip, i) => (
            <motion.div
              key={trip.slug}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={localizedPath(locale, `/trips/${trip.slug}`)}
                className="group block"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={trip.coverImage}
                    alt={trip.coverAlt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <p className="mt-4 text-sm tracking-widest text-muted-foreground uppercase">
                  {trip.country} · {trip.durationDays} {dict.common.days.toLowerCase()}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold group-hover:text-primary">
                  {trip.title}
                </h3>
                <p className="mt-2 text-base text-muted-foreground">{trip.tagline}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10">
          <Button asChild size="lg" variant="outline" className="group text-base">
            <Link href={localizedPath(locale, "/discover")}>
              {dict.common.discoverTrips}
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
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
            {dict.home.ctaTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-snow/75">
            {dict.home.ctaBody}
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="accent" className="text-base">
              <Link href="/planner/new">{dict.common.startPlanning}</Link>
            </Button>
            <Button asChild size="lg" variant="onDark" className="text-base">
              <Link href={localizedPath(locale, "/blog")}>{dict.nav.blog}</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}
