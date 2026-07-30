import { tripTemplates, type TripTemplate } from "@/data/trips/templates";

export type DestinationRegion = {
  slug: string;
  name: string;
  continent: TripTemplate["continent"];
  headline: string;
  description: string;
  coverImage: string;
  coverAlt: string;
  countries: string[];
  bestSeason: string;
  drivingNotes: string;
  seoKeywords: string[];
};

export const destinationRegions: DestinationRegion[] = [
  {
    slug: "north-america",
    name: "North America",
    continent: "North America",
    headline: "Rockies, coasts and long honest miles.",
    description:
      "Plan cross-border and cross-province drives with real distances — from Western Canada loops to Pacific Coast classics.",
    coverImage: "/images/trip-western-canada.jpg",
    coverAlt: "Mountain lake along a North American road trip",
    countries: ["Canada", "United States"],
    bestSeason: "May–September (region dependent)",
    drivingNotes: "Right-side driving. Long interstate and Trans-Canada segments.",
    seoKeywords: [
      "North America road trip",
      "Canada USA drive",
      "Western Canada itinerary",
    ],
  },
  {
    slug: "europe",
    name: "Europe",
    continent: "Europe",
    headline: "Passes, vignettes and village overnight stays.",
    description:
      "Build Alpine circuits, Highlands loops and Nordic ring roads with multilingual signage and border-aware pacing.",
    coverImage: "/images/trip-alps.jpg",
    coverAlt: "European Alps switchback road",
    countries: ["Iceland", "United Kingdom", "Switzerland", "France", "Italy", "Austria"],
    bestSeason: "June–September",
    drivingNotes:
      "Mostly right-side; UK left-side. Tolls and vignettes vary by country.",
    seoKeywords: [
      "Europe road trip",
      "Alps itinerary",
      "Iceland Ring Road",
    ],
  },
  {
    slug: "asia",
    name: "Asia",
    continent: "Asia",
    headline: "Onsen towns, expressways and autumn color.",
    description:
      "Self-drive Japan with left-side pacing — Hokkaido loops timed for foliage, toll roads and rural fuel stops.",
    coverImage: "/images/trip-japan-hokkaido.jpg",
    coverAlt: "Autumn mountain road in Hokkaido, Japan",
    countries: ["Japan"],
    bestSeason: "September–October for Hokkaido color",
    drivingNotes: "Left-side driving. ETC toll systems common on expressways.",
    seoKeywords: [
      "Japan road trip",
      "Hokkaido self drive",
      "Asia road trip itinerary",
    ],
  },
  {
    slug: "oceania",
    name: "Oceania",
    continent: "Oceania",
    headline: "Left-side coastal highways and alpine passes.",
    description:
      "New Zealand South Island and Australia’s east coast — beach towns, hinterland detours and long sunny segments.",
    coverImage: "/images/trip-new-zealand.jpg",
    coverAlt: "New Zealand South Island highway toward the Alps",
    countries: ["New Zealand", "Australia"],
    bestSeason: "November–March (NZ); April–October (AU east)",
    drivingNotes: "Left-side driving. Allow fatigue margins on long coastal days.",
    seoKeywords: [
      "New Zealand road trip",
      "Australia east coast drive",
      "Oceania itinerary",
    ],
  },
  {
    slug: "south-america",
    name: "South America",
    continent: "South America",
    headline: "Patagonian wind, gravel and granite.",
    description:
      "Chile–Argentina routes with weather buffers, fuel planning and park overnight strategy baked into the day list.",
    coverImage: "/images/trip-patagonia.jpg",
    coverAlt: "Patagonia road toward granite peaks",
    countries: ["Chile", "Argentina"],
    bestSeason: "December–March",
    drivingNotes: "Right-side driving. Gravel segments and wind require slower pace.",
    seoKeywords: [
      "Patagonia road trip",
      "Carretera Austral",
      "South America self drive",
    ],
  },
  {
    slug: "africa",
    name: "Africa",
    continent: "Africa",
    headline: "Atlas passes and Atlantic finish lines.",
    description:
      "Morocco’s mountain-to-coast arcs — kasbah overnight stays, pass driving and French/Arabic signage awareness.",
    coverImage: "/images/trip-morocco-atlas.jpg",
    coverAlt: "Atlas Mountains road in Morocco",
    countries: ["Morocco"],
    bestSeason: "March–May, September–November",
    drivingNotes: "Right-side driving. Mountain nights cool quickly; plan fuel early.",
    seoKeywords: [
      "Morocco road trip",
      "Atlas Mountains drive",
      "Africa self drive itinerary",
    ],
  },
];

export function getDestinationRegion(slug: string) {
  return destinationRegions.find((r) => r.slug === slug) ?? null;
}

export function tripsForRegion(slug: string) {
  const region = getDestinationRegion(slug);
  if (!region) return [];
  return tripTemplates.filter((t) => t.continent === region.continent);
}
