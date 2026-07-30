import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { destinationRegions } from "@/data/destinations/regions";
import { localeMetadataBase } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/destinations",
    "Road trip destinations worldwide",
    "Explore road trip regions across North America, Europe, Asia, Oceania, South America and Africa — with templates tuned to local driving.",
  ),
  keywords: [
    "road trip destinations",
    "international road trips",
    "self drive holidays",
  ],
};

export default function DestinationsPage() {
  const dict = getDictionary("en");
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">Destinations</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {dict.destinations.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {dict.destinations.body}
        </p>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {destinationRegions.map((region) => (
            <Link
              key={region.slug}
              href={`/destinations/${region.slug}`}
              className="group block"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={region.coverImage}
                  alt={region.coverAlt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <p className="mt-4 text-sm tracking-widest text-muted-foreground uppercase">
                {region.countries.slice(0, 3).join(" · ")}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold group-hover:text-primary">
                {region.name}
              </h2>
              <p className="mt-2 text-base text-muted-foreground">
                {region.headline}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
