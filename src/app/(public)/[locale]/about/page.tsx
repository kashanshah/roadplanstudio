import type { Metadata } from "next";
import Image from "next/image";
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
  return localeMetadataBase(locale, "/about", dict.about.title, dict.about.body);
}

export default async function LocalizedAboutPage({ params }: Props) {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main>
        <section className="relative isolate min-h-[48svh] overflow-hidden">
          <Image
            src="/images/blog-international.jpg"
            alt=""
            fill
            priority
            className="absolute inset-0 -z-20 object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.174_0.012_175.5/0.55)_0%,oklch(0.174_0.012_175.5/0.9)_100%)]" />
          <div className="relative mx-auto flex min-h-[48svh] max-w-6xl flex-col justify-end px-4 pb-12 pt-28 sm:px-6">
            <p className="eyebrow text-accent">{dict.nav.about}</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-snow sm:text-5xl">
              {dict.about.title}
            </h1>
          </div>
        </section>
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <p className="text-xl leading-relaxed text-muted-foreground">
            {dict.about.body}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/planner/new">{dict.common.startPlanning}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={localizedPath(locale, "/contact")}>
                {dict.nav.contact}
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
