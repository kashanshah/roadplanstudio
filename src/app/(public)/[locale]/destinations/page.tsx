import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { resolveMarketingLocale } from "@/lib/i18n/resolve";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { destinationRegions } from "@/data/destinations/regions";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeMetadataBase } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  return localeMetadataBase(
    locale,
    "/destinations",
    dict.destinations.title,
    dict.destinations.body,
  );
}

export default async function LocalizedDestinationsPage({ params }: Props) {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">{dict.nav.destinations}</p>
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
              href={localizedPath(locale, `/destinations/${region.slug}`)}
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
              <h2 className="mt-4 font-display text-2xl font-semibold group-hover:text-primary">
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
