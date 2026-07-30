import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/blog/blog-post-view";
import { blogPosts, getBlogPost } from "@/data/blog/posts";
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
  return <BlogPostView post={post} locale="en" />;
}
