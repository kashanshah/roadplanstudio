import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalPage, legalPath } from "@/data/legal/pages";
import { resolveMarketingLocale } from "@/lib/i18n/resolve";
import { localeMetadataBase } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getLegalPage("cookies");
  if (!page) return { title: "Not found", robots: { index: false } };
  const locale = resolveMarketingLocale((await params).locale);
  return localeMetadataBase(locale, legalPath("cookies"), page.title, page.description);
}

export default async function LocalizedCookiesPage({ params }: Props) {
  const locale = resolveMarketingLocale((await params).locale);
  const page = getLegalPage("cookies");
  if (!page) notFound();
  return <LegalDocument page={page} locale={locale} />;
}
