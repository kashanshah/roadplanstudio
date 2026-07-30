import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { legalPages, legalPath } from "@/data/legal/pages";
import { localeMetadataBase } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/legal",
    "Legal",
    "Terms of Service, Privacy Policy, Cookie Policy, Acceptable Use, and Copyright for RoadPlan Studio.",
  ),
};

export default function LegalHubPage() {
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">Legal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Policies & terms
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The documents that govern RoadPlan Studio accounts, trip data, cookies,
          and fair use.
        </p>
        <ul className="mt-10 space-y-6">
          {legalPages.map((page) => (
            <li key={page.slug} className="border-t border-border pt-5">
              <Link
                href={legalPath(page.slug)}
                className="group block transition-colors"
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
          Questions?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact us
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
