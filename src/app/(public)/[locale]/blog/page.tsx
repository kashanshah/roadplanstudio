import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { resolveMarketingLocale } from "@/lib/i18n/resolve";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { listBlogPosts } from "@/data/blog/posts";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeMetadataBase } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  return localeMetadataBase(locale, "/blog", dict.blog.title, dict.blog.body);
}

export default async function LocalizedBlogPage({ params }: Props) {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  const posts = listBlogPosts();
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">{dict.nav.blog}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {dict.blog.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {dict.blog.body}
        </p>
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={localizedPath(locale, `/blog/${post.slug}`)}
              className="group block"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.coverAlt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold group-hover:text-primary">
                {post.title}
              </h2>
              <p className="mt-2 text-base text-muted-foreground">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
