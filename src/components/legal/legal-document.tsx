import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { getLegalPage, legalNav, legalPath, type LegalPage } from "@/data/legal/pages";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function LegalDocument({
  page,
  locale = "en",
}: {
  page: LegalPage;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow text-primary">{dict.footer.legal}</p>
            <nav className="mt-4 space-y-1" aria-label="Legal">
              {legalNav.map((item) => {
                const href = localizedPath(locale, legalPath(item.slug));
                const active = item.slug === page.slug;
                return (
                  <Link
                    key={item.slug}
                    href={href}
                    className={
                      active
                        ? "block rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-foreground"
                        : "block rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                    }
                    aria-current={active ? "page" : undefined}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>
            <p className="mt-6 text-sm text-muted-foreground">
              <Link
                href={localizedPath(locale, "/contact")}
                className="text-primary hover:underline"
              >
                {dict.nav.contact}
              </Link>
            </p>
          </aside>

          <article>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: {page.updatedAt}
            </p>
            <div className="mt-10 space-y-10">
              {page.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                    {section.paragraphs.map((p) => (
                      <p key={p.slice(0, 64)}>{p}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function LegalPageOrNull({
  slug,
  locale = "en",
}: {
  slug: string;
  locale?: Locale;
}) {
  const page = getLegalPage(slug);
  if (!page) return null;
  return <LegalDocument page={page} locale={locale} />;
}
