import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/blog/blog-post-view";
import { blogPosts, getBlogPost } from "@/data/blog/posts";
import { locales } from "@/lib/i18n/config";
import { resolveMarketingLocale } from "@/lib/i18n/resolve";
import { localeMetadataBase } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales
    .filter((l) => l !== "en")
    .flatMap((locale) =>
      blogPosts.map((p) => ({ locale, slug: p.slug })),
    );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = resolveMarketingLocale(raw);
  const post = getBlogPost(slug);
  if (!post) return { title: "Post not found", robots: { index: false } };

  return {
    ...localeMetadataBase(
      locale,
      `/blog/${post.slug}`,
      post.title,
      post.description,
    ),
    authors: [{ name: post.author.name }],
    keywords: post.tags,
    openGraph: {
      ...localeMetadataBase(
        locale,
        `/blog/${post.slug}`,
        post.title,
        post.description,
      ).openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: post.coverImage, alt: post.coverAlt }],
    },
  };
}

export default async function LocalizedBlogPostPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = resolveMarketingLocale(raw);
  const post = getBlogPost(slug);
  if (!post) notFound();
  // Posts are authored in English; still serve them under locale URLs
  // so language switching / blog index links do not 404.
  return <BlogPostView post={post} locale={locale} />;
}
