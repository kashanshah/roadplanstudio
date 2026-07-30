import type { Metadata } from "next";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { localeMetadataBase } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/privacy",
    "Privacy policy",
    "How RoadPlan Studio collects, stores and uses account and trip data.",
  ),
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">Legal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Privacy policy
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: July 30, 2026
        </p>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            RoadPlan Studio (“we”) operates www.roadplanstudio.com. This policy
            explains what we collect when you plan trips, create an account or
            contact us.
          </p>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Data we process
          </h2>
          <p>
            Account data (name, email, session tokens) via Better Auth stored in
            Neon PostgreSQL. Trip content you create (days, stops, lodging,
            collaborator emails). Optional media uploads to S3-compatible
            storage. Contact and feature-request form submissions.
          </p>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Guest mode
          </h2>
          <p>
            Guest itineraries remain in your browser until you claim them into
            an account. Clearing site data removes guest state.
          </p>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Contact
          </h2>
          <p>
            Privacy questions: use the{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact form
            </a>{" "}
            with topic “support”.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
