import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalPage } from "@/data/legal/pages";
import { localeMetadataBase } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/cookies",
    "Cookie Policy",
    "Cookies and similar technologies used by RoadPlan Studio for sessions, preferences, and security.",
  ),
};

export default function CookiesPage() {
  const page = getLegalPage("cookies");
  if (!page) notFound();
  return <LegalDocument page={page} locale="en" />;
}
