import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationRegionView } from "@/components/destinations/destination-region-view";
import {
  destinationRegions,
  getDestinationRegion,
} from "@/data/destinations/regions";
import { localeMetadataBase } from "@/lib/i18n/seo";

type Props = { params: Promise<{ region: string }> };

export function generateStaticParams() {
  return destinationRegions.map((r) => ({ region: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: slug } = await params;
  const region = getDestinationRegion(slug);
  if (!region) return { title: "Not found", robots: { index: false } };
  return {
    ...localeMetadataBase(
      "en",
      `/destinations/${region.slug}`,
      `${region.name} road trips`,
      region.description,
    ),
    keywords: region.seoKeywords,
  };
}

export default async function DestinationRegionPage({ params }: Props) {
  const { region: slug } = await params;
  const region = getDestinationRegion(slug);
  if (!region) notFound();
  return <DestinationRegionView region={region} locale="en" />;
}
