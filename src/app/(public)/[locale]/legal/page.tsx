import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { legalPages, legalPath } from "@/data/legal/pages";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveMarketingLocale } from "@/lib/i18n/resolve";
import { localeMetadataBase } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  return localeMetadataBase(
    locale,
    "/legal",
    dict.footer.legal,
    "Terms of Service, Privacy Policy, Cookie Policy, Acceptable Use, and Copyright for RoadPlan Studio.",
  );
}

export default async function LocalizedLegalHubPage({ params }: Props) {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">{dict.footer.legal}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {dict.footer.legal}
        </h1>
        <ul className="mt-10 space-y-6">
          {legalPages.map((page) => (
            <li key={page.slug} className="border-t border-border pt-5">
              <Link
                href={localizedPath(locale, legalPath(page.slug))}
                className="group block"
              >
                <h2 className="font-display text-2xl font-semibold group-hover:text-primary">
                  {page.title}
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  {page.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-12 text-base text-muted-foreground">
          <Link
            href={localizedPath(locale, "/contact")}
            className="text-primary hover:underline"
          >
            {dict.nav.contact}
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
