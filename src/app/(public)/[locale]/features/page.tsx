import type { Metadata } from "next";
import Link from "next/link";
import { resolveMarketingLocale } from "@/lib/i18n/resolve";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeMetadataBase } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  return localeMetadataBase(
    locale,
    "/features",
    dict.featuresPage.title,
    dict.featuresPage.body,
  );
}

export default async function LocalizedFeaturesPage({ params }: Props) {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">{dict.nav.features}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {dict.featuresPage.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {dict.featuresPage.body}
        </p>
        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/planner/new">{dict.common.startPlanning}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={localizedPath(locale, "/request-feature")}>
              {dict.nav.requestFeature}
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
