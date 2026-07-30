import type { Locale } from "@/lib/i18n/config";
import { defaultLocale, localeOgLocale, localizedPath, locales } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/constants";

export function hreflangAlternates(path = "/") {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${SITE_URL}${localizedPath(locale, path)}`;
  }
  languages["x-default"] = `${SITE_URL}${localizedPath(defaultLocale, path)}`;
  return { languages };
}

export function localeMetadataBase(locale: Locale, path: string, title: string, description: string) {
  const url = `${SITE_URL}${localizedPath(locale, path)}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: hreflangAlternates(path).languages,
    },
    openGraph: {
      title,
      description,
      url,
      locale: localeOgLocale[locale],
      siteName: "RoadPlan Studio",
      type: "website" as const,
    },
  };
}
