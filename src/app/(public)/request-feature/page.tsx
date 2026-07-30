import type { Metadata } from "next";
import { FeatureRequestForm } from "@/components/forms/feature-request-form";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { localeMetadataBase } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/request-feature",
    "Request a feature",
    "Suggest planner improvements, new trip templates, languages or collaboration tools for RoadPlan Studio.",
  ),
};

export default function RequestFeaturePage() {
  const dict = getDictionary("en");
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">Product</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {dict.feature.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {dict.feature.body}
        </p>
        <div className="mt-12">
          <FeatureRequestForm dict={dict} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
