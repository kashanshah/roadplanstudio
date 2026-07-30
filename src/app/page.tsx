import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { localeMetadataBase } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  ...localeMetadataBase("en", "/", SITE_NAME, SITE_DESCRIPTION),
};

export default function HomePage() {
  return <LandingPage locale="en" />;
}
