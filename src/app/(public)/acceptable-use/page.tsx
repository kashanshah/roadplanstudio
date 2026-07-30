import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalPage } from "@/data/legal/pages";
import { localeMetadataBase } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/acceptable-use",
    "Acceptable Use Policy",
    "Rules for fair use of RoadPlan Studio’s planner, APIs, templates, and collaboration tools.",
  ),
};

export default function AcceptableUsePage() {
  const page = getLegalPage("acceptable-use");
  if (!page) notFound();
  return <LegalDocument page={page} locale="en" />;
}
