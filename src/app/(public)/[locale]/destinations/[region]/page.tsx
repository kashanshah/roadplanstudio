import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationRegionView } from "@/components/destinations/destination-region-view";
import {
  destinationRegions,
  getDestinationRegion,
} from "@/data/destinations/regions";
import { locales } from "@/lib/i18n/config";
import { resolveMarketingLocale } from "@/lib/i18n/resolve";
import { localeMetadataBase } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string; region: string }> };

export function generateStaticParams() {
  return locales
    .filter((l) => l !== "en")
    .flatMap((locale) =>
      destinationRegions.map((r) => ({ locale, region: r.slug })),
    );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, region: slug } = await params;
  const locale = resolveMarketingLocale(raw);
  const region = getDestinationRegion(slug);
  if (!region) return { title: "Not found", robots: { index: false } };
  return {
    ...localeMetadataBase(
      locale,
      `/destinations/${region.slug}`,
      `${region.name} road trips`,
      region.description,
    ),
    keywords: region.seoKeywords,
  };
}

export default async function LocalizedDestinationRegionPage({
  params,
}: Props) {
  const { locale: raw, region: slug } = await params;
  const locale = resolveMarketingLocale(raw);
  const region = getDestinationRegion(slug);
  if (!region) notFound();
  return <DestinationRegionView region={region} locale={locale} />;
}
