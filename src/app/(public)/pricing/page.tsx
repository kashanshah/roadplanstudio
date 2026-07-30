import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";
import { localeMetadataBase } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/pricing",
    "Pricing",
    "Plan road trips free as a guest. Cloud sync, sharing and collaboration unlock with a RoadPlan Studio account.",
  ),
};

const tiers = [
  {
    name: "Guest",
    price: "Free",
    body: "Full planner in the browser. Ephemeral to your session — perfect for trying a route.",
    points: [
      "Multi-day itinerary canvas",
      "Map + stop search",
      "Template remix entry",
    ],
    cta: { href: "/planner/new", label: "Start as guest" },
  },
  {
    name: "Cloud account",
    price: "Free to start",
    body: "Save across devices, invite tripmates and publish when you want the trip discoverable.",
    points: [
      "Cloud sync via Better Auth",
      "Viewer / editor permissions",
      "Share links & invites",
    ],
    cta: { href: "/auth/register", label: "Create account" },
  },
];

export default function PricingPage() {
  const dict = getDictionary("en");
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">Pricing</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {dict.pricing.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {dict.pricing.body}
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className="border-t border-border pt-8"
            >
              <p className="text-sm tracking-widest text-muted-foreground uppercase">
                {tier.name}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                {tier.price}
              </h2>
              <p className="mt-4 text-base text-muted-foreground">{tier.body}</p>
              <ul className="mt-6 space-y-2 text-base">
                {tier.points.map((p) => (
                  <li key={p} className="border-l-2 border-primary/30 pl-4">
                    {p}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8" size="lg">
                <Link href={tier.cta.href}>{tier.cta.label}</Link>
              </Button>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
