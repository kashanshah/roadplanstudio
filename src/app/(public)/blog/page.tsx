import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { listBlogPosts } from "@/data/blog/posts";
import { localeMetadataBase } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/blog",
    "Road trip planning blog",
    "Pacing, packing, borders and collaboration — field notes for map-first international road trips.",
  ),
  keywords: [
    "road trip blog",
    "road trip planning tips",
    "international driving tips",
  ],
};

export default function BlogIndexPage() {
  const dict = getDictionary("en");
  const posts = listBlogPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "RoadPlan Studio Blog",
    url: "https://www.roadplanstudio.com/blog",
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      datePublished: p.publishedAt,
      url: `https://www.roadplanstudio.com/blog/${p.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background text-[17px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">Blog</p>
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
              href={`/blog/${post.slug}`}
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
              <p className="mt-4 text-sm tracking-widest text-muted-foreground uppercase">
                {post.category} · {post.readingMinutes} min
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold group-hover:text-primary">
                {post.title}
              </h2>
              <p className="mt-2 text-base text-muted-foreground">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
