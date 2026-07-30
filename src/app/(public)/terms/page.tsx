import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalPage } from "@/data/legal/pages";
import { localeMetadataBase } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/terms",
    "Terms of Service",
    "Terms governing use of RoadPlan Studio’s website, planner, templates, and collaboration features.",
  ),
};

export default function TermsPage() {
  const page = getLegalPage("terms");
  if (!page) notFound();
  return <LegalDocument page={page} locale="en" />;
}
