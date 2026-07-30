import Image from "next/image";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import type { BlogPost } from "@/data/blog/posts";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

const originalLanguageNotice: Record<Locale, string> = {
  en: "",
  fr: "Cet article est pour l’instant disponible en anglais.",
  es: "Este artículo está disponible por ahora en inglés.",
  de: "Dieser Beitrag ist derzeit auf Englisch verfügbar.",
  ja: "この記事は現在英語のみです。",
};

export function BlogPostView({
  post,
  locale = "en",
}: {
  post: BlogPost;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);
  const contentIsEnglish = locale !== "en";
  const notice = originalLanguageNotice[locale];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: `${SITE_URL}${post.coverImage}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: "en",
    author: { "@type": "Organization", name: post.author.name },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo-mark.svg` },
    },
    mainEntityOfPage: `${SITE_URL}${localizedPath(locale, `/blog/${post.slug}`)}`,
  };

  return (
    <div className="min-h-screen bg-background text-[17px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav />
      <article>
        <header className="relative isolate min-h-[44svh] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.coverAlt}
            fill
            priority
            className="absolute inset-0 -z-20 object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.174_0.012_175.5/0.5)_0%,oklch(0.174_0.012_175.5/0.9)_100%)]" />
          <div className="relative mx-auto flex min-h-[44svh] max-w-3xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6">
            <p className="eyebrow text-accent">
              {post.category} · {post.readingMinutes} min read
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-snow sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-base text-snow/75">
              {post.publishedAt} · {post.author.name}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {contentIsEnglish && notice ? (
            <p
              className="mb-8 rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground"
              lang={locale}
            >
              {notice}
            </p>
          ) : null}
          <div lang="en">
            <p className="text-xl leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
            <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground">
              {post.body.map((para) => (
                <p key={para.slice(0, 48)}>{para}</p>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm tracking-wide text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
          <p className="mt-12 border-t border-border pt-8 text-base text-muted-foreground">
            <Link
              href={localizedPath(locale, "/blog")}
              className="text-primary hover:underline"
            >
              ← {dict.nav.blog}
            </Link>
          </p>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
