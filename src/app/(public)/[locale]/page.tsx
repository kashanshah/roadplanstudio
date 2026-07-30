import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { resolveMarketingLocale } from "@/lib/i18n/resolve";
import { localeMetadataBase } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  return localeMetadataBase(locale, "/", dict.home.headline, dict.home.subhead);
}

export default async function LocalizedHomePage({ params }: Props) {
  const locale = resolveMarketingLocale((await params).locale);
  return <LandingPage locale={locale} />;
}
