import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";

/** Non-English marketing locale from a dynamic [locale] segment. */
export function resolveMarketingLocale(raw: string): Locale {
  if (!isLocale(raw) || raw === "en") notFound();
  return raw;
}
