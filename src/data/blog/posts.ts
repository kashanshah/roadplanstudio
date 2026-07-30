export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverImage: string;
  coverAlt: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  author: { name: string; role: string };
  locales: string[];
  body: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-pace-a-multi-day-road-trip",
    title: "How to pace a multi-day road trip without burning out",
    description:
      "A practical framework for daily drive limits, daylight windows and recovery overnights — so your itinerary matches the trip you actually want.",
    excerpt:
      "Most failed road trips fail on day three. Here is how to design pace before you lock the hotels.",
    category: "Planning",
    tags: ["pacing", "itinerary design", "daylight"],
    coverImage: "/images/blog-daylight.jpg",
    coverAlt: "Golden-hour light across a mountain highway through pine forest",
    publishedAt: "2026-03-12",
    updatedAt: "2026-06-01",
    readingMinutes: 8,
    author: { name: "RoadPlan Studio", role: "Editorial" },
    locales: ["en", "fr", "es", "de", "ja"],
    body: [
      "The best road trips feel spacious. That does not happen by accident — it happens when you protect drive time as a budget, not a leftover.",
      "Start with a hard daily ceiling. For mountain or coastal roads, treat 4–5 hours of wheel time as a full day. Anything longer needs an intentional reason: a ferry window, a border crossing, or a single long transit day bookended by rest.",
      "Map daylight next. In high latitudes — Iceland, Scotland, Hokkaido in autumn — sunset is a planning constraint, not a mood. Put the scenic segment in the brightest hours and save grocery stops for the dimming edge of the day.",
      "Build recovery overnights every three to four days. A town with a walkable dinner, laundry and a late checkout will save more trip quality than one extra attraction.",
      "Finally, leave empty blocks. RoadPlan Studio keeps day timelines editable for a reason: weather, road works and the café that turns into an afternoon will rearrange your map. Plan for that on purpose.",
    ],
  },
  {
    slug: "packing-list-for-international-road-trips",
    title: "The international road-trip packing list that actually fits the car",
    description:
      "What to pack for self-drive trips across borders — documents, adapters, soft bags and the small tools that prevent itinerary meltdowns.",
    excerpt:
      "Soft duffels beat hard cases. Here is the cross-border kit we recommend before you collect the rental.",
    category: "Gear",
    tags: ["packing", "international", "rental cars"],
    coverImage: "/images/blog-packing.jpg",
    coverAlt: "Packed road-trip bags and maps in a car trunk",
    publishedAt: "2026-04-02",
    updatedAt: "2026-04-02",
    readingMinutes: 7,
    author: { name: "RoadPlan Studio", role: "Editorial" },
    locales: ["en", "fr", "es", "de"],
    body: [
      "International self-drive trips fail less often on scenery and more often on paperwork and luggage geometry.",
      "Documents first: license, international driving permit where required, passport copies offline, rental confirmation, insurance green card or equivalent, and hotel address strings your phone can open without signal.",
      "Pack soft-sided. Hard suitcases punish hatchbacks on Alpine and Highlands rentals. Two medium duffels plus a daypack scales better across ferries and hostel stairs.",
      "Cable discipline matters. One multi-port USB-C charger, a 12V adapter, and country plugs for every border you cross. Label them before day one.",
      "Add the unglamorous kit: microfiber cloths, a paper atlas backup for tunnels, a reusable bottle, basic first aid, and a printed Day 1–2 outline. Cloud plans are great until the mountain valley has no bars.",
    ],
  },
  {
    slug: "planning-with-tripmates-without-chaos",
    title: "Planning with tripmates without turning the group chat into chaos",
    description:
      "How shared itineraries, permission levels and vote-friendly stop lists keep multi-person road trips aligned.",
    excerpt:
      "Editors and viewers exist for a reason. Structure the collaboration before you argue about lunch stops.",
    category: "Collaboration",
    tags: ["tripmates", "sharing", "collaboration"],
    coverImage: "/images/blog-tripmates.jpg",
    coverAlt: "Shared maps and coffee on a cabin table for trip planning",
    publishedAt: "2026-04-18",
    updatedAt: "2026-05-10",
    readingMinutes: 6,
    author: { name: "RoadPlan Studio", role: "Product" },
    locales: ["en", "fr", "es", "de", "ja"],
    body: [
      "Group trips die in unread message threads. A shared itinerary with clear permissions is not bureaucracy — it is hospitality for your future selves.",
      "Give one person EDITOR rights for route structure. Everyone else can be VIEWER until lodging is locked. Then open editing for stop suggestions inside each day.",
      "Separate must-sees from nice-to-haves. Must-sees get pinned early and drive the overnight towns. Nice-to-haves float and can be skipped when weather flips.",
      "Use comments on the stop, not the general chat. Context lives next to the pin: parking notes, ticket links, kid-friendly flags.",
      "Agree on a nightly reset. Ten minutes to mark visited, skipped and tomorrow’s first departure time keeps the map honest while you travel.",
    ],
  },
  {
    slug: "left-side-driving-cheat-sheet",
    title: "Left-side driving cheat sheet for North American travelers",
    description:
      "Practical tips for first-time left-side drivers heading to the UK, Japan, Australia or New Zealand.",
    excerpt:
      "Roundabouts, passenger-side instincts and quiet first hours — a calm briefing before you leave the rental lot.",
    category: "Driving",
    tags: ["left-side driving", "UK", "Japan", "Australia", "New Zealand"],
    coverImage: "/images/trip-scotland.jpg",
    coverAlt: "Narrow Highlands road through misty Scottish glens",
    publishedAt: "2026-05-05",
    updatedAt: "2026-05-05",
    readingMinutes: 9,
    author: { name: "RoadPlan Studio", role: "Editorial" },
    locales: ["en", "ja"],
    body: [
      "If you learned to drive on the right, your first left-side day will feel like writing with the other hand. That is normal — and temporary.",
      "Book an automatic if shifting is not already muscle memory. Reduce variables on day one.",
      "Leave the airport lot for a quiet residential loop before any motorway. Narrate aloud: mirror, signal, center line on your right.",
      "Roundabouts are the main event in the UK and NZ. Yield to traffic already circulating, stay in lane early, and ignore the urge to look the ‘usual’ way first — look the correct way deliberately.",
      "Build shorter days for the first 48 hours. RoadPlan templates for Scotland, Hokkaido, Australia and New Zealand already assume left-side pacing so you are not stacking hero miles onto new instincts.",
    ],
  },
  {
    slug: "best-shoulder-seasons-for-road-trips",
    title: "Best shoulder seasons for road trips around the world",
    description:
      "When to drive the Alps, Iceland, Patagonia, Morocco and Western Canada for fewer crowds and still-open passes.",
    excerpt:
      "Peak summer is optional. These shoulder windows keep roads open and lodging sane.",
    category: "Seasons",
    tags: ["shoulder season", "Alps", "Iceland", "Patagonia", "Morocco"],
    coverImage: "/images/trip-alps.jpg",
    coverAlt: "Alpine switchbacks above meadows in shoulder season light",
    publishedAt: "2026-05-22",
    updatedAt: "2026-05-22",
    readingMinutes: 10,
    author: { name: "RoadPlan Studio", role: "Editorial" },
    locales: ["en", "fr", "de", "es"],
    body: [
      "Shoulder season is when road trips feel designed for humans again: open passes, shorter queues, and lodging that still answers the phone.",
      "European Alps: late June and September. High passes are typically open, thunderstorms are real, and you skip the August rush.",
      "Iceland: early June and late August. You trade a little daylight for quieter Ring Road pullouts — still pack for every weather system in one afternoon.",
      "Patagonia: December and March edges. Wind never clocks out, but shoulder weeks ease campsite pressure around Torres del Paine.",
      "Morocco Atlas routes: March–April and October. Heat softens, mountain roads stay workable, and coastal Essaouira is at its best.",
      "Western Canada: early September. Lakes are still vivid, kids are back in school, and first snow dusting on high cols is a feature if you watch forecasts.",
    ],
  },
  {
    slug: "building-an-international-itinerary-that-crosses-borders",
    title: "Building an international itinerary that crosses borders cleanly",
    description:
      "Currency, vignettes, ferries, roaming and overnight buffer strategy for multi-country European and Southern Hemisphere drives.",
    excerpt:
      "Borders are itinerary objects. Treat them like attractions with paperwork attached.",
    category: "International",
    tags: ["borders", "Europe", "ferries", "vignettes"],
    coverImage: "/images/blog-international.jpg",
    coverAlt: "Open road through varied international terrain under a wide sky",
    publishedAt: "2026-06-08",
    updatedAt: "2026-07-01",
    readingMinutes: 9,
    author: { name: "RoadPlan Studio", role: "Editorial" },
    locales: ["en", "fr", "es", "de", "ja"],
    body: [
      "A border is not a line on a map — it is time, money and sometimes a queue in the rain. Put it on the day timeline explicitly.",
      "In Europe, budget for vignettes and toll systems before you roll. Switzerland, Austria and parts of the Balkans are not ‘figure it out at the booth’ experiences if you value morning light.",
      "Ferry days deserve their own day type. Check-in buffers, vehicle height limits and weather cancellations will humble an overstuffed schedule.",
      "Keep one offline payment method and a small amount of local cash at each currency change. Card coverage is excellent until it is not — mountain towns still surprise.",
      "Roaming and offline maps: download the corridor before you leave Wi‑Fi. RoadPlan’s multi-country templates (Alps, Patagonia, Morocco) already group overnight towns to reduce needless frontier zigzags.",
    ],
  },
  {
    slug: "why-map-first-itineraries-beat-spreadsheets",
    title: "Why map-first itineraries beat spreadsheets",
    description:
      "Distance, elevation and overnight geometry explain more about trip quality than a color-coded sheet ever will.",
    excerpt:
      "Spreadsheets count hours. Maps show whether those hours are humane.",
    category: "Product",
    tags: ["maps", "itinerary", "UX"],
    coverImage: "/images/hero-road.jpg",
    coverAlt: "Winding mountain highway through misty spruce forest",
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    readingMinutes: 5,
    author: { name: "RoadPlan Studio", role: "Product" },
    locales: ["en", "fr", "es", "de", "ja"],
    body: [
      "Spreadsheets are excellent at lying politely. They will accept an eight-hour mountain day next to a ‘light museum afternoon’ without blinking.",
      "Map-first planning surfaces the truth: switchbacks, ferry gaps, one-way coastal segments and the hotel that is technically 90 minutes away — on paper — but over a pass.",
      "When you reorder stops in RoadPlan Studio, route math updates with the canvas. That feedback loop is the product. It is also how you stop arguing from vibes.",
      "Use the spreadsheet afterward if you want a budget rollup. Build the trip on the map.",
    ],
  },
  {
    slug: "remixing-a-template-for-your-own-dates",
    title: "Remixing a public template for your own dates",
    description:
      "How to take a RoadPlan Studio public itinerary — Western Canada, Iceland, Alps and more — and adapt duration, season and lodging without losing the spine.",
    excerpt:
      "Templates are spines, not scripts. Here is how to remix without unraveling the route.",
    category: "How-to",
    tags: ["templates", "remix", "discover"],
    coverImage: "/images/trip-western-canada.jpg",
    coverAlt: "Glacier lake and peaks from a Western Canada itinerary",
    publishedAt: "2026-07-04",
    updatedAt: "2026-07-04",
    readingMinutes: 6,
    author: { name: "RoadPlan Studio", role: "Product" },
    locales: ["en", "fr", "es", "de", "ja"],
    body: [
      "Open a public template from Discover. Your first job is not to customize everything — it is to protect the overnight spine.",
      "Keep the cities that create sane day lengths. Swap attractions inside the day freely. If you remove an overnight town, re-check the neighboring drive immediately.",
      "Adjust for season: daylight, open passes, ferry schedules. A July Iceland plan is not an October Iceland plan with different jackets — it is a different geometry.",
      "When you sign in, save the remix to the cloud and invite tripmates as viewers until the spine is stable. Then open editor seats.",
      "If you need a feature the template does not cover yet, send it via Request a Feature — template demand shapes what we seed next.",
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug) ?? null;
}

export function listBlogPosts(limit?: number) {
  const sorted = [...blogPosts].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export function listBlogPostsByCategory(category: string) {
  return listBlogPosts().filter(
    (p) => p.category.toLowerCase() === category.toLowerCase(),
  );
}
