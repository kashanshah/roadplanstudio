export const locales = ["en", "fr", "es", "de", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  ja: "日本語",
};

export const localeOgLocale: Record<Locale, string> = {
  en: "en_CA",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
  ja: "ja_JP",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Path without locale prefix for English; prefixed for others. */
export function localizedPath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean || "/";
  return `/${locale}${clean}`;
}

export function stripLocalePrefix(pathname: string): {
  locale: Locale;
  pathname: string;
} {
  const parts = pathname.split("/").filter(Boolean);
  const maybe = parts[0];
  if (maybe && isLocale(maybe) && maybe !== defaultLocale) {
    const rest = "/" + parts.slice(1).join("/");
    return { locale: maybe, pathname: rest === "/" ? "/" : rest };
  }
  return { locale: defaultLocale, pathname: pathname || "/" };
}
