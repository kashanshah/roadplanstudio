"use client";

import Link from "next/link";
import { destinationRegions } from "@/data/destinations/regions";
import { tripTemplates } from "@/data/trips/templates";
import { listBlogPosts } from "@/data/blog/posts";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Blurb = {
  title: string;
  body: string;
};

const blurbsByLocale: Record<Locale, Blurb[]> = {
  en: [
    {
      title: "Map-first road trip planning",
      body: "RoadPlan Studio turns multi-day drives into honest itineraries — distances, daylight, overnight towns and tripmate permissions in one canvas. Plan as a guest, then save to the cloud when the route feels real.",
    },
    {
      title: "International self-drive itineraries",
      body: "Remix templates for Western Canada, Iceland’s Ring Road, the European Alps, Hokkaido autumn loops, New Zealand’s South Island, Patagonia, Scotland and more — with local season and driving-side context.",
    },
    {
      title: "Built for how trips actually unfold",
      body: "Reorder stops, keep lodging anchors stable, and share viewer or editor access with tripmates. Pair Discover templates with destination guides and field notes from the blog before you collect the rental.",
    },
  ],
  fr: [
    {
      title: "Planification de road trip sur carte",
      body: "RoadPlan Studio transforme les trajets multi-jours en itinéraires réalistes — distances, lumière du jour, nuits étapes et permissions co-voyageurs. Commencez en invité, sauvegardez ensuite dans le cloud.",
    },
    {
      title: "Itinéraires internationaux",
      body: "Remixez des modèles pour l’Ouest canadien, la Route 1 islandaise, les Alpes, Hokkaidō, la Nouvelle-Zélande, la Patagonie, l’Écosse et plus — avec saison et sens de circulation locaux.",
    },
    {
      title: "Pensé pour le voyage réel",
      body: "Réordonnez les étapes, gardez les hébergements, partagez en lecture ou édition. Associez Discover, les destinations et le blog avant de prendre le volant.",
    },
  ],
  es: [
    {
      title: "Planificación de road trips en el mapa",
      body: "RoadPlan Studio convierte rutas de varios días en itinerarios honestos — distancias, luz de día, pernoctas y permisos para compañeros. Empieza como invitado y guarda en la nube cuando sea real.",
    },
    {
      title: "Itinerarios internacionales",
      body: "Remixa plantillas de Canadá occidental, Islandia, los Alpes, Hokkaidō, Nueva Zelanda, Patagonia, Escocia y más — con temporada y sentido de circulación locales.",
    },
    {
      title: "Hecho para cómo se viaja de verdad",
      body: "Reordena paradas, mantén alojamientos y comparte como visor o editor. Combina Discover, destinos y el blog antes de recoger el coche.",
    },
  ],
  de: [
    {
      title: "Kartenbasierte Roadtrip-Planung",
      body: "RoadPlan Studio macht Mehrtagesfahrten zu ehrlichen Itineraren — Distanzen, Tageslicht, Übernachtungsorte und Mitreisenden-Rechte. Starte als Gast, speichere später in der Cloud.",
    },
    {
      title: "Internationale Self-Drive-Routen",
      body: "Remixe Vorlagen für Westkanada, Islands Ringstraße, die Alpen, Hokkaidō, Neuseeland, Patagonien, Schottland und mehr — mit Saison- und Fahrseiten-Kontext.",
    },
    {
      title: "Für echte Reisen gebaut",
      body: "Stopps neu ordnen, Übernachtungen halten, Viewer- oder Editor-Rechte teilen. Kombiniere Discover, Reiseziele und den Blog vor der Mietwagen-Abholung.",
    },
  ],
  ja: [
    {
      title: "地図ファーストのロードトリップ計画",
      body: "RoadPlan Studioは複数日のドライブを、距離・日照・宿泊・同行者権限つきの現実的な旅程にします。ゲストで始め、本気になったらクラウドへ。",
    },
    {
      title: "海外セルフドライブ旅程",
      body: "西カナダ、アイスランド環状道路、アルプス、北海道、ニュージーランド、パタゴニア、スコットランドなどのテンプレートを、季節と通行区分の文脈つきでリミックス。",
    },
    {
      title: "実際の旅の進み方に合わせて",
      body: "立ち寄りを並べ替え、宿の軸を保ち、閲覧/編集権限で共有。レンタカーの前に Discover・目的地・ブログを活用。",
    },
  ],
};

export function SitePreFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const blurbs = blurbsByLocale[locale] ?? blurbsByLocale.en;
  const featuredTrips = tripTemplates.slice(0, 5);
  const regions = destinationRegions.slice(0, 6);
  const posts = listBlogPosts(3);

  return (
    <section
      aria-label="Explore RoadPlan Studio"
      className="border-t border-border bg-secondary/40"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">{dict.nav.discover}</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {dict.destinations.title}
        </h2>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {dict.destinations.body}
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {blurbs.map((b) => (
            <article key={b.title} className="border-t border-border pt-5">
              <h3 className="text-lg font-semibold text-foreground">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {b.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-10 border-t border-border pt-10 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium tracking-wide text-foreground">
              {dict.nav.destinations}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {regions.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={localizedPath(locale, `/destinations/${r.slug}`)}
                    className="transition-colors hover:text-foreground"
                  >
                    {r.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={localizedPath(locale, "/destinations")}
                  className="text-primary hover:underline"
                >
                  {dict.common.readMore} →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium tracking-wide text-foreground">
              {dict.common.discoverTrips}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {featuredTrips.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={localizedPath(locale, `/trips/${t.slug}`)}
                    className="transition-colors hover:text-foreground"
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={localizedPath(locale, "/discover")}
                  className="text-primary hover:underline"
                >
                  {dict.common.readMore} →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium tracking-wide text-foreground">
              {dict.nav.blog}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={localizedPath(locale, `/blog/${p.slug}`)}
                    className="transition-colors hover:text-foreground"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={localizedPath(locale, "/blog")}
                  className="text-primary hover:underline"
                >
                  {dict.common.readMore} →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
