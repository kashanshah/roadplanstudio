import type { Metadata } from "next";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { localeMetadataBase } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/terms",
    "Terms of use",
    "Terms governing use of RoadPlan Studio’s website, planner and public templates.",
  ),
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">Legal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Terms of use
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: July 30, 2026
        </p>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            By using RoadPlan Studio you agree to these terms. The service helps
            you plan multi-day road trips; it does not replace official road,
            border, weather or travel advisories.
          </p>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Accounts & content
          </h2>
          <p>
            You are responsible for itinerary accuracy and for content you share
            with tripmates. Do not upload unlawful material. Public templates are
            provided as-is for remixing.
          </p>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Maps & third parties
          </h2>
          <p>
            Location features may use Google Maps Platform APIs subject to
            Google’s terms. Email delivery may use Resend. Hosting is on Vercel
            with Neon Postgres and S3-compatible storage.
          </p>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Contact
          </h2>
          <p>
            Questions about these terms:{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact us
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
