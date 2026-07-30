import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { defaultLocale, localeOgLocale, localizedPath, locales } from "@/lib/i18n/config";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
} as const;

export function hreflangAlternates(path = "/") {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${SITE_URL}${localizedPath(locale, path)}`;
  }
  languages["x-default"] = `${SITE_URL}${localizedPath(defaultLocale, path)}`;
  return { languages };
}

export function shareImages(image?: {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}) {
  const img = image
    ? {
        url: image.url,
        alt: image.alt ?? SITE_NAME,
        width: image.width ?? 1200,
        height: image.height ?? 630,
      }
    : { ...DEFAULT_OG_IMAGE };
  return [img];
}

export function localeMetadataBase(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  image?: { url: string; alt?: string; width?: number; height?: number },
): Metadata {
  const url = `${SITE_URL}${localizedPath(locale, path)}`;
  const images = shareImages(image);

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
      siteName: SITE_NAME,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

export function tripShareMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  imageAlt?: string;
  keywords?: string[];
}): Metadata {
  const image = opts.imageUrl
    ? { url: opts.imageUrl, alt: opts.imageAlt ?? opts.title }
    : undefined;
  const base = localeMetadataBase(
    opts.locale,
    opts.path,
    opts.title,
    opts.description,
    image,
  );

  return {
    ...base,
    keywords: opts.keywords,
    openGraph: {
      ...base.openGraph,
      type: "article",
    },
  };
}
