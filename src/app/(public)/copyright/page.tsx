import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalPage } from "@/data/legal/pages";
import { localeMetadataBase } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/copyright",
    "Copyright & Intellectual Property",
    "Ownership of RoadPlan Studio software, brand assets, and how to report infringement.",
  ),
};

export default function CopyrightPage() {
  const page = getLegalPage("copyright");
  if (!page) notFound();
  return <LegalDocument page={page} locale="en" />;
}
