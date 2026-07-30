import { westernCanadaTemplateDays } from "@/data/seeds/western-canada-template";

export type TripDifficulty = "easy" | "moderate" | "hard";

export type TripTemplateStop = {
  name: string;
  type: "attraction" | "lodging" | "waypoint";
  lat: number;
  lng: number;
  note?: string;
};

export type TripTemplateDay = {
  title: string;
  summary: string;
  stops: TripTemplateStop[];
};

export type TripTemplate = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  region: string;
  country: string;
  countries: string[];
  continent:
    | "North America"
    | "Europe"
    | "Asia"
    | "Oceania"
    | "South America"
    | "Africa";
  durationDays: number;
  totalDistanceKm: number;
  difficulty: TripDifficulty;
  coverImage: string;
  coverAlt: string;
  highlights: string[];
  bestSeason: string;
  languages: string[];
  currency: string;
  drivingSide: "left" | "right";
  seoKeywords: string[];
  days: TripTemplateDay[];
};

export const tripTemplates: TripTemplate[] = [
  {
    slug: "western-canada-2026",
    title: "Western Canada Road Trip 2026",
    tagline: "Prairies to peaks to Pacific — then home again.",
    description:
      "A 13-day circular loop from Saskatoon through Calgary, Kananaskis, Banff, Jasper, Vancouver, Clearwater and Edmonton. Optimized daily flow with fixed lodging anchors — Kananaskis on Sunday to beat Banff crowds, early Lake Louise/Moraine shuttles, and Wells Gray falls moved to Clearwater day.",
    region: "Western Canada",
    country: "Canada",
    countries: ["Canada"],
    continent: "North America",
    durationDays: 13,
    totalDistanceKm: 4200,
    difficulty: "moderate",
    coverImage: "/images/trip-western-canada.jpg",
    coverAlt: "Turquoise glacier lake framed by snowy peaks in Western Canada",
    highlights: [
      "Kananaskis first, then Banff & Yoho early-bird loop",
      "Icefields Parkway to Jasper & VIA Rail scenic day",
      "Sea-to-Sky, Victoria ferry & Wells Gray falls",
    ],
    bestSeason: "June–September",
    languages: ["en", "fr"],
    currency: "CAD",
    drivingSide: "right",
    seoKeywords: [
      "Western Canada road trip",
      "Banff Jasper itinerary",
      "Icefields Parkway drive",
    ],
    days: westernCanadaTemplateDays(),
  },
  {
    slug: "pacific-coast-highway",
    title: "Pacific Coast Highway",
    tagline: "Cliffside asphalt from Oregon mist to Big Sur light.",
    description:
      "A classic West Coast drive linking Portland, the Oregon Coast, Redwood country, Mendocino, Big Sur and Los Angeles. Honest drive times, overnight towns and pullouts worth the stop.",
    region: "US West Coast",
    country: "United States",
    countries: ["United States"],
    continent: "North America",
    durationDays: 10,
    totalDistanceKm: 2100,
    difficulty: "moderate",
    coverImage: "/images/trip-pacific-coast.jpg",
    coverAlt: "Pacific Coast Highway along ocean cliffs at golden hour",
    highlights: [
      "Cannon Beach & Oregon dunes",
      "Redwood National and State Parks",
      "Big Sur overlooks",
    ],
    bestSeason: "May–October",
    languages: ["en"],
    currency: "USD",
    drivingSide: "right",
    seoKeywords: [
      "Pacific Coast Highway itinerary",
      "California road trip",
      "Oregon coast drive",
    ],
    days: [
      {
        title: "Portland → Cannon Beach",
        summary: "City to coast.",
        stops: [
          {
            name: "Portland",
            type: "waypoint",
            lat: 45.5152,
            lng: -122.6784,
          },
          {
            name: "Cannon Beach",
            type: "lodging",
            lat: 45.8918,
            lng: -123.9615,
          },
        ],
      },
      {
        title: "Big Sur corridor",
        summary: "Slow miles, big views.",
        stops: [
          {
            name: "Bixby Creek Bridge",
            type: "attraction",
            lat: 36.3714,
            lng: -121.9018,
          },
          {
            name: "Monterey",
            type: "lodging",
            lat: 36.6002,
            lng: -121.8947,
          },
        ],
      },
    ],
  },
  {
    slug: "iceland-ring-road",
    title: "Iceland Ring Road",
    tagline: "One island, one loop, endless weather.",
    description:
      "Circumnavigate Iceland on Route 1 with geothermal lagoons, black-sand beaches, glacier tongues and highland detours paced for real Nordic daylight.",
    region: "Iceland",
    country: "Iceland",
    countries: ["Iceland"],
    continent: "Europe",
    durationDays: 10,
    totalDistanceKm: 1400,
    difficulty: "moderate",
    coverImage: "/images/trip-iceland-ring.jpg",
    coverAlt: "Iceland Ring Road through mossy lava fields and mountains",
    highlights: [
      "Golden Circle day loop",
      "South Coast waterfalls",
      "Eastfjords & Mývatn",
    ],
    bestSeason: "June–August",
    languages: ["en", "is"],
    currency: "ISK",
    drivingSide: "right",
    seoKeywords: [
      "Iceland Ring Road itinerary",
      "Route 1 Iceland",
      "Iceland road trip 10 days",
    ],
    days: [
      {
        title: "Reykjavík → Vík",
        summary: "South Coast classics.",
        stops: [
          {
            name: "Seljalandsfoss",
            type: "attraction",
            lat: 63.6156,
            lng: -19.9886,
          },
          {
            name: "Vík",
            type: "lodging",
            lat: 63.4186,
            lng: -19.0060,
          },
        ],
      },
    ],
  },
  {
    slug: "hokkaido-autumn-loop",
    title: "Hokkaido Autumn Loop",
    tagline: "Volcanoes, onsen towns and maple fire.",
    description:
      "A self-drive circuit of Hokkaido linking Sapporo, Furano, Biei, Daisetsuzan, Shiretoko and Hakodate — timed for autumn color and clear mountain roads.",
    region: "Hokkaido",
    country: "Japan",
    countries: ["Japan"],
    continent: "Asia",
    durationDays: 12,
    totalDistanceKm: 1800,
    difficulty: "moderate",
    coverImage: "/images/trip-japan-hokkaido.jpg",
    coverAlt: "Mountain road through autumn birch forest in Hokkaido",
    highlights: [
      "Furano & Biei patchwork hills",
      "Daisetsuzan national park",
      "Shiretoko peninsula",
    ],
    bestSeason: "September–October",
    languages: ["ja", "en"],
    currency: "JPY",
    drivingSide: "left",
    seoKeywords: [
      "Hokkaido road trip",
      "Japan self drive itinerary",
      "Hokkaido autumn drive",
    ],
    days: [
      {
        title: "Sapporo → Furano",
        summary: "Into the hills.",
        stops: [
          {
            name: "Sapporo",
            type: "waypoint",
            lat: 43.0618,
            lng: 141.3545,
          },
          {
            name: "Furano",
            type: "lodging",
            lat: 43.3420,
            lng: 142.3832,
          },
        ],
      },
    ],
  },
  {
    slug: "new-zealand-south-island",
    title: "New Zealand South Island",
    tagline: "Fjords, glaciers and alpine passes.",
    description:
      "Christchurch to Queenstown via Kaikōura, the West Coast glaciers, Wanaka and Milford Sound — a South Island classic with ferry options and honest mountain pacing.",
    region: "South Island",
    country: "New Zealand",
    countries: ["New Zealand"],
    continent: "Oceania",
    durationDays: 14,
    totalDistanceKm: 2600,
    difficulty: "moderate",
    coverImage: "/images/trip-new-zealand.jpg",
    coverAlt: "South Island highway toward Southern Alps peaks",
    highlights: [
      "Kaikōura coast",
      "Franz Josef / Fox glaciers",
      "Milford Sound day",
    ],
    bestSeason: "November–March",
    languages: ["en", "mi"],
    currency: "NZD",
    drivingSide: "left",
    seoKeywords: [
      "New Zealand South Island road trip",
      "Milford Sound drive",
      "Queenstown itinerary",
    ],
    days: [
      {
        title: "Christchurch → Kaikōura",
        summary: "Coastal start.",
        stops: [
          {
            name: "Christchurch",
            type: "waypoint",
            lat: -43.5321,
            lng: 172.6362,
          },
          {
            name: "Kaikōura",
            type: "lodging",
            lat: -42.4008,
            lng: 173.6814,
          },
        ],
      },
    ],
  },
  {
    slug: "alps-grand-tour",
    title: "Alps Grand Tour",
    tagline: "Four countries, endless switchbacks.",
    description:
      "A premium Alpine circuit through Switzerland, France, Italy and Austria — lake towns, high passes and village overnight stays with multilingual road signage handled.",
    region: "European Alps",
    country: "Switzerland",
    countries: ["Switzerland", "France", "Italy", "Austria"],
    continent: "Europe",
    durationDays: 12,
    totalDistanceKm: 1900,
    difficulty: "hard",
    coverImage: "/images/trip-alps.jpg",
    coverAlt: "Alpine switchback road above meadows and snow peaks",
    highlights: [
      "Bernese Oberland lakes",
      "Chamonix & Mont Blanc",
      "Dolomites day",
    ],
    bestSeason: "June–September",
    languages: ["de", "fr", "it", "en"],
    currency: "EUR / CHF",
    drivingSide: "right",
    seoKeywords: [
      "Alps road trip",
      "Switzerland France Italy drive",
      "European Alps itinerary",
    ],
    days: [
      {
        title: "Zürich → Interlaken",
        summary: "Into the Oberland.",
        stops: [
          {
            name: "Zürich",
            type: "waypoint",
            lat: 47.3769,
            lng: 8.5417,
          },
          {
            name: "Interlaken",
            type: "lodging",
            lat: 46.6863,
            lng: 7.8632,
          },
        ],
      },
    ],
  },
  {
    slug: "patagonia-carretera-austral",
    title: "Patagonia & Carretera Austral",
    tagline: "End-of-the-world gravel and granite.",
    description:
      "A rugged southern Chile and Argentina itinerary linking Puerto Varas, the Carretera Austral, Torres del Paine and El Calafate — built for weather buffers and fuel planning.",
    region: "Patagonia",
    country: "Chile",
    countries: ["Chile", "Argentina"],
    continent: "South America",
    durationDays: 16,
    totalDistanceKm: 3200,
    difficulty: "hard",
    coverImage: "/images/trip-patagonia.jpg",
    coverAlt: "Patagonian road toward jagged granite peaks and glacial lake",
    highlights: [
      "Carretera Austral segments",
      "Torres del Paine",
      "Perito Moreno glacier",
    ],
    bestSeason: "December–March",
    languages: ["es", "en"],
    currency: "CLP / ARS",
    drivingSide: "right",
    seoKeywords: [
      "Patagonia road trip",
      "Carretera Austral itinerary",
      "Torres del Paine drive",
    ],
    days: [
      {
        title: "Puerto Varas → Chaitén",
        summary: "Ferry and fjords.",
        stops: [
          {
            name: "Puerto Varas",
            type: "lodging",
            lat: -41.3178,
            lng: -72.9827,
          },
        ],
      },
    ],
  },
  {
    slug: "scottish-highlands-loop",
    title: "Scottish Highlands Loop",
    tagline: "Single-track roads, lochs and whisky towns.",
    description:
      "Edinburgh to Skye and back via Glencoe, Fort William, the NC500 sample and whisky coast — left-side driving with generous layover days for weather.",
    region: "Scottish Highlands",
    country: "United Kingdom",
    countries: ["United Kingdom"],
    continent: "Europe",
    durationDays: 9,
    totalDistanceKm: 1500,
    difficulty: "moderate",
    coverImage: "/images/trip-scotland.jpg",
    coverAlt: "Scottish Highlands road through misty glens and lochs",
    highlights: [
      "Glencoe & Fort William",
      "Isle of Skye",
      "Whisky coast overnight",
    ],
    bestSeason: "May–September",
    languages: ["en"],
    currency: "GBP",
    drivingSide: "left",
    seoKeywords: [
      "Scottish Highlands road trip",
      "Skye itinerary drive",
      "Scotland self drive",
    ],
    days: [
      {
        title: "Edinburgh → Glencoe",
        summary: "Into the Highlands.",
        stops: [
          {
            name: "Edinburgh",
            type: "waypoint",
            lat: 55.9533,
            lng: -3.1883,
          },
          {
            name: "Glencoe",
            type: "lodging",
            lat: 56.6826,
            lng: -5.1023,
          },
        ],
      },
    ],
  },
  {
    slug: "australia-east-coast",
    title: "Australia East Coast",
    tagline: "Beaches, hinterland and reef towns.",
    description:
      "Sydney to Cairns with coastal highways, hinterland detours, Byron Bay, Fraser Island access points and Tropical North Queensland — left-side driving under strong sun.",
    region: "East Coast Australia",
    country: "Australia",
    countries: ["Australia"],
    continent: "Oceania",
    durationDays: 18,
    totalDistanceKm: 3100,
    difficulty: "moderate",
    coverImage: "/images/trip-australia-east.jpg",
    coverAlt: "Australian coastal highway overlooking turquoise ocean",
    highlights: [
      "Byron Bay & hinterland",
      "Sunshine Coast to Fraser",
      "Cairns & reef gateway",
    ],
    bestSeason: "April–October",
    languages: ["en"],
    currency: "AUD",
    drivingSide: "left",
    seoKeywords: [
      "Australia east coast road trip",
      "Sydney to Cairns drive",
      "Byron Bay itinerary",
    ],
    days: [
      {
        title: "Sydney → Byron Bay",
        summary: "Coastal climb north.",
        stops: [
          {
            name: "Sydney",
            type: "waypoint",
            lat: -33.8688,
            lng: 151.2093,
          },
          {
            name: "Byron Bay",
            type: "lodging",
            lat: -28.6474,
            lng: 153.6020,
          },
        ],
      },
    ],
  },
  {
    slug: "morocco-atlas-coast",
    title: "Morocco Atlas & Coast",
    tagline: "Kasbahs, passes and Atlantic light.",
    description:
      "Marrakech through the High Atlas to the Sahara fringe, then west to Essaouira — a North African drive with mountain passes, riad overnight stays and coastal wind-down days.",
    region: "Morocco",
    country: "Morocco",
    countries: ["Morocco"],
    continent: "Africa",
    durationDays: 11,
    totalDistanceKm: 1600,
    difficulty: "moderate",
    coverImage: "/images/trip-morocco-atlas.jpg",
    coverAlt: "Winding Atlas Mountains road through ochre valleys",
    highlights: [
      "Tizi n'Tichka pass",
      "Ait Benhaddou & desert edge",
      "Essaouira Atlantic finish",
    ],
    bestSeason: "March–May, September–November",
    languages: ["fr", "ar", "en"],
    currency: "MAD",
    drivingSide: "right",
    seoKeywords: [
      "Morocco road trip",
      "Atlas Mountains drive",
      "Marrakech to Essaouira",
    ],
    days: [
      {
        title: "Marrakech → Ouarzazate",
        summary: "Over the Atlas.",
        stops: [
          {
            name: "Marrakech",
            type: "waypoint",
            lat: 31.6295,
            lng: -7.9811,
          },
          {
            name: "Ait Benhaddou",
            type: "attraction",
            lat: 31.0470,
            lng: -7.1320,
          },
          {
            name: "Ouarzazate",
            type: "lodging",
            lat: 30.9335,
            lng: -6.9370,
          },
        ],
      },
    ],
  },
];

export function getTripTemplate(slug: string) {
  return tripTemplates.find((t) => t.slug === slug) ?? null;
}

export function listTripTemplates(opts?: {
  continent?: TripTemplate["continent"];
  country?: string;
  limit?: number;
}) {
  let list = [...tripTemplates];
  if (opts?.continent) {
    list = list.filter((t) => t.continent === opts.continent);
  }
  if (opts?.country) {
    list = list.filter((t) =>
      t.countries.some(
        (c) => c.toLowerCase() === opts.country!.toLowerCase(),
      ),
    );
  }
  if (opts?.limit) list = list.slice(0, opts.limit);
  return list;
}

export function tripTemplatesByContinent() {
  const map = new Map<TripTemplate["continent"], TripTemplate[]>();
  for (const trip of tripTemplates) {
    const bucket = map.get(trip.continent) ?? [];
    bucket.push(trip);
    map.set(trip.continent, bucket);
  }
  return map;
}
