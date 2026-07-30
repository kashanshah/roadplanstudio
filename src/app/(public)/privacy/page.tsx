import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalPage } from "@/data/legal/pages";
import { localeMetadataBase } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/privacy",
    "Privacy Policy",
    "How RoadPlan Studio collects, stores, and uses account, trip, and contact data.",
  ),
};

export default function PrivacyPage() {
  const page = getLegalPage("privacy");
  if (!page) notFound();
  return <LegalDocument page={page} locale="en" />;
}
