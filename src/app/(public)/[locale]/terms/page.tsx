import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalPage, legalPath } from "@/data/legal/pages";
import { resolveMarketingLocale } from "@/lib/i18n/resolve";
import { localeMetadataBase } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

function pageMeta(slug: string, locale: string) {
  const page = getLegalPage(slug);
  if (!page) return { title: "Not found", robots: { index: false as const } };
  const loc = resolveMarketingLocale(locale);
  return localeMetadataBase(loc, legalPath(slug), page.title, page.description);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return pageMeta("terms", (await params).locale);
}

export default async function LocalizedTermsPage({ params }: Props) {
  const locale = resolveMarketingLocale((await params).locale);
  const page = getLegalPage("terms");
  if (!page) notFound();
  return <LegalDocument page={page} locale={locale} />;
}
