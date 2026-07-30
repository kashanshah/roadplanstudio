import type { Metadata } from "next";
import { resolveMarketingLocale } from "@/lib/i18n/resolve";
import { ContactForm } from "@/components/forms/contact-form";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeMetadataBase } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  return localeMetadataBase(locale, "/contact", dict.contact.title, dict.contact.body);
}

export default async function LocalizedContactPage({ params }: Props) {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">{dict.nav.contact}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {dict.contact.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {dict.contact.body}
        </p>
        <div className="mt-12">
          <ContactForm dict={dict} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
