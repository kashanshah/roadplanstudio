import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { blogPosts, getBlogPost } from "@/data/blog/posts";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { localeMetadataBase } from "@/lib/i18n/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post not found", robots: { index: false } };
  return {
    ...localeMetadataBase("en", `/blog/${post.slug}`, post.title, post.description),
    authors: [{ name: post.author.name }],
    keywords: post.tags,
    openGraph: {
      ...localeMetadataBase("en", `/blog/${post.slug}`, post.title, post.description)
        .openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: post.coverImage, alt: post.coverAlt }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: `${SITE_URL}${post.coverImage}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: post.author.name },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo-mark.svg` },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
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
          <p className="text-xl leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground">
            {post.body.map((para) => (
              <p key={para.slice(0, 48)}>{para}</p>
            ))}
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
            <Link href="/blog" className="text-primary hover:underline">
              ← All posts
            </Link>
          </p>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
