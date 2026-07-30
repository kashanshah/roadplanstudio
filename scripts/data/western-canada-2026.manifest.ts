/**
 * Human-authored Western Canada 2026 seed manifest.
 * Optimized master itinerary with fixed accommodations.
 * Queries are tuned for Google Places Text Search.
 */

export type ManifestStopKind =
  | "attraction"
  | "hotel"
  | "custom"
  | "transit"
  | "city_overnight";

export type ManifestStop = {
  key: string;
  query: string;
  type: ManifestStopKind;
  optional?: boolean;
  notes?: string;
};

export type ManifestDay = {
  dayIndex: number;
  date: string;
  title: string;
  routeSummary: string;
  notes?: string;
  stops: ManifestStop[];
  overnight?: ManifestStop;
};

/** Bias searches toward Canada (Places locationBias circle max is 50km). */
export const WESTERN_CANADA_BIAS = {
  latitude: 51.05,
  longitude: -114.07,
  radiusMeters: 50_000,
  regionCode: "CA",
};

export const WESTERN_CANADA_TRIP = {
  title: "Western Canada Road Trip 2026",
  slug: "western-canada-2026",
  description:
    "Thirteen days from Saskatoon through Calgary, Kananaskis, Banff, Jasper, Vancouver, Clearwater and Edmonton — an optimized circular loop with fixed lodging and geographically ordered days.",
  coverPhotoUrl: "/images/trip-western-canada.jpg",
  durationDays: 13,
  totalDistanceKm: 4200,
  difficulty: "moderate" as const,
  visibility: "public" as const,
};

/**
 * Optimized master itinerary (Aug 1–13, 2026).
 * Fixed overnights preserved; daily flow reordered geographically/chronologically.
 */
export const WESTERN_CANADA_DAYS: ManifestDay[] = [
  {
    dayIndex: 1,
    date: "2026-08-01",
    title: "Day 1 – Saskatoon → Calgary",
    routeSummary: "~620 km · 6–7 hrs",
    notes: "Arrival & prep · Saturday",
    stops: [
      {
        key: "d1-drive",
        query: "Saskatoon SK",
        type: "custom",
        notes: "Depart Saskatoon",
      },
      {
        key: "d1-crossiron",
        query: "CrossIron Mills, Rocky View County, AB",
        type: "attraction",
        optional: true,
        notes: "Shopping & road-trip supplies",
      },
      {
        key: "d1-chinook",
        query: "Chinook Centre, Calgary, AB",
        type: "attraction",
        optional: true,
        notes: "Shopping & road-trip supplies",
      },
      {
        key: "d1-downtown",
        query: "Downtown Calgary, AB",
        type: "attraction",
        notes: "Evening · Relax downtown",
      },
    ],
    overnight: {
      key: "d1-hotel",
      query: "Calgary Tower, Calgary, AB, Canada",
      type: "city_overnight",
      notes: "City overnight — Calgary (Calgary Tower TBD)",
    },
  },
  {
    dayIndex: 2,
    date: "2026-08-02",
    title: "Day 2 – Calgary → Kananaskis → Canmore → Calgary",
    routeSummary: "~220–300 km · 3–5 hrs + sightseeing",
    notes:
      "Flipped to beat Sunday Banff crowds · Morning Kananaskis valley, afternoon Canmore",
    stops: [
      {
        key: "d2-barrier",
        query: "Barrier Lake, Kananaskis, AB",
        type: "attraction",
        notes: "Morning",
      },
      {
        key: "d2-village",
        query: "Kananaskis Village, AB",
        type: "attraction",
        notes: "Morning",
      },
      {
        key: "d2-wedge",
        query: "Wedge Pond, Kananaskis, AB",
        type: "attraction",
        notes: "Morning",
      },
      {
        key: "d2-upper-k",
        query: "Upper Kananaskis Lake, AB",
        type: "attraction",
        notes: "Mid-day",
      },
      {
        key: "d2-spray",
        query: "Spray Lakes Reservoir, AB",
        type: "attraction",
        notes: "Mid-day",
      },
      {
        key: "d2-canmore",
        query: "Canmore, AB",
        type: "attraction",
        notes: "Afternoon · Lunch, shopping & exploring",
      },
      {
        key: "d2-sheep",
        query: "Sheep River Provincial Park, AB",
        type: "attraction",
        optional: true,
        notes: "Evening · if energy permits",
      },
      {
        key: "d2-sheep-falls",
        query: "Sheep River Falls, AB",
        type: "attraction",
        optional: true,
        notes: "Evening · if energy permits",
      },
    ],
    overnight: {
      key: "d2-hotel",
      query: "Calgary Tower, Calgary, AB, Canada",
      type: "city_overnight",
      notes: "City overnight — Calgary (Calgary Tower TBD)",
    },
  },
  {
    dayIndex: 3,
    date: "2026-08-03",
    title: "Day 3 – Calgary → Banff & Yoho → Calgary",
    routeSummary: "~320–380 km · 4–5 hrs + sightseeing",
    notes:
      "Early bird mountain loop · 6:00 AM departure for Lake Louise & Moraine Lake shuttles",
    stops: [
      {
        key: "d3-louise",
        query: "Lake Louise, Banff National Park, AB",
        type: "attraction",
        notes: "First thing · pre-booked shuttle",
      },
      {
        key: "d3-moraine",
        query: "Moraine Lake, Banff National Park, AB",
        type: "attraction",
        notes: "First thing · pre-booked shuttle",
      },
      {
        key: "d3-emerald",
        query: "Emerald Lake, Yoho National Park, BC",
        type: "attraction",
        notes: "Late morning · west into BC while Banff crowds peak",
      },
      {
        key: "d3-johnston",
        query: "Johnston Canyon, Banff National Park, AB",
        type: "attraction",
        notes: "Afternoon · heading east",
      },
      {
        key: "d3-minnewanka",
        query: "Lake Minnewanka, Banff, AB",
        type: "attraction",
        notes: "Afternoon · Banff townsite loop",
      },
      {
        key: "d3-two-jack",
        query: "Two Jack Lake, Banff, AB",
        type: "attraction",
        notes: "Afternoon · Banff townsite loop",
      },
      {
        key: "d3-bow-falls",
        query: "Bow Falls, Banff, AB",
        type: "attraction",
        notes: "Afternoon · Banff townsite loop",
      },
      {
        key: "d3-surprise",
        query: "Surprise Corner Viewpoint, Banff, AB",
        type: "attraction",
        notes: "Afternoon · Banff townsite loop",
      },
      {
        key: "d3-banff-ave",
        query: "Banff Avenue, Banff, AB",
        type: "attraction",
        notes: "Evening · Dinner before return to Calgary",
      },
    ],
    overnight: {
      key: "d3-hotel",
      query: "Calgary Tower, Calgary, AB, Canada",
      type: "city_overnight",
      notes: "City overnight — Calgary (Calgary Tower TBD)",
    },
  },
  {
    dayIndex: 4,
    date: "2026-08-04",
    title: "Day 4 – Calgary → Icefields Parkway → Jasper → Hinton",
    routeSummary: "~430–500 km · 6–8 hrs + sightseeing",
    notes: "Glacier Highway · Tuesday",
    stops: [
      {
        key: "d4-bow",
        query: "Bow Lake, Banff National Park, AB",
        type: "attraction",
        notes: "Morning · Bow Lake Viewpoint",
      },
      {
        key: "d4-peyto",
        query: "Peyto Lake, Banff National Park, AB",
        type: "attraction",
        notes: "Morning",
      },
      {
        key: "d4-mistaya",
        query: "Mistaya Canyon, Banff National Park, AB",
        type: "attraction",
        notes: "Morning · Mistaya Canyon Trail Head",
      },
      {
        key: "d4-icefield",
        query: "Columbia Icefield Glacier Discovery Centre, Jasper National Park, AB",
        type: "attraction",
        notes: "Mid-day · Columbia Icefield / Glacier Gallery",
      },
      {
        key: "d4-glacier",
        query: "Athabasca Glacier, Jasper National Park, AB",
        type: "attraction",
        notes: "Mid-day",
      },
      {
        key: "d4-pass",
        query: "Athabasca Pass Lookout, Jasper National Park, AB",
        type: "attraction",
        notes: "Afternoon",
      },
      {
        key: "d4-honeymoon",
        query: "Honeymoon Lake, Jasper National Park, AB",
        type: "attraction",
        notes: "Afternoon",
      },
      {
        key: "d4-sunwapta",
        query: "Sunwapta Falls, Jasper National Park, AB",
        type: "attraction",
        notes: "Afternoon",
      },
      {
        key: "d4-athabasca",
        query: "Athabasca Falls, Jasper National Park, AB",
        type: "attraction",
        notes: "Afternoon",
      },
      {
        key: "d4-annette",
        query: "Annette Lake, Jasper National Park, AB",
        type: "attraction",
        notes: "Late afternoon",
      },
      {
        key: "d4-maligne",
        query: "Maligne Lake, Jasper National Park, AB",
        type: "attraction",
        notes: "Late afternoon",
      },
      {
        key: "d4-jasper",
        query: "Jasper, AB",
        type: "attraction",
        notes: "Late afternoon · Explore Jasper town before Hinton",
      },
    ],
    overnight: {
      key: "d4-hotel",
      query: "Coast Hinton Hotel, 571 Gregg Avenue, Hinton, AB T7V 1N1",
      type: "hotel",
    },
  },
  {
    dayIndex: 5,
    date: "2026-08-05",
    title: "Day 5 – Jasper → Prince George (VIA Rail)",
    routeSummary: "Full-day train journey",
    notes:
      "The driving break · Park vehicles at Jasper station · Scenic VIA Rail through the Rockies and northern BC",
    stops: [
      {
        key: "d5-jasper-station",
        query: "Jasper VIA Rail Station, Jasper, AB",
        type: "transit",
        notes: "Park vehicles · board VIA Rail",
      },
      {
        key: "d5-pg-station",
        query: "Prince George VIA Rail Station, Prince George, BC",
        type: "transit",
      },
    ],
    overnight: {
      key: "d5-hotel",
      query: "Hyatt Place Prince George, 585 Dominion Street, Prince George, BC V2L 1T7",
      type: "hotel",
    },
  },
  {
    dayIndex: 6,
    date: "2026-08-06",
    title: "Day 6 – Prince George → Jasper (train) → Kamloops",
    routeSummary: "Train + ~440 km · 5–6 hrs",
    notes: "Return & transition · Collect vehicles in Jasper · Drive south to Kamloops",
    stops: [
      {
        key: "d6-jasper-collect",
        query: "Jasper VIA Rail Station, Jasper, AB",
        type: "transit",
        notes: "Morning · Collect vehicles",
      },
      {
        key: "d6-riverside",
        query: "Riverside Park, Kamloops, BC",
        type: "attraction",
        notes: "Afternoon stretch",
      },
      {
        key: "d6-kenna",
        query: "Kenna Cartwright Park, Kamloops, BC",
        type: "attraction",
        notes: "Afternoon stretch",
      },
      {
        key: "d6-downtown",
        query: "Downtown Kamloops, BC",
        type: "attraction",
        notes: "Evening · Relax downtown",
      },
    ],
    overnight: {
      key: "d6-hotel",
      query: "Wingate by Wyndham Kamloops, 1180 Rogers Way, Kamloops, BC V1S 1N5",
      type: "hotel",
    },
  },
  {
    dayIndex: 7,
    date: "2026-08-07",
    title: "Day 7 – Kamloops → Vancouver",
    routeSummary: "~355 km · 4–5 hrs",
    notes: "Coast arrival · Friday",
    stops: [
      {
        key: "d7-gastown",
        query: "Gastown, Vancouver, BC",
        type: "attraction",
        notes: "Afternoon",
      },
      {
        key: "d7-canada-place",
        query: "Canada Place, Vancouver, BC",
        type: "attraction",
        notes: "Afternoon",
      },
      {
        key: "d7-coal",
        query: "Coal Harbour, Vancouver, BC",
        type: "attraction",
        notes: "Afternoon",
      },
      {
        key: "d7-stanley",
        query: "Stanley Park, Vancouver, BC",
        type: "attraction",
        notes: "Late afternoon · Rent bikes or walk",
      },
      {
        key: "d7-denman",
        query: "Denman Street, Vancouver, BC",
        type: "attraction",
        notes: "Evening · Dinner & cafés",
      },
      {
        key: "d7-english-bay",
        query: "English Bay Beach, Vancouver, BC",
        type: "attraction",
        notes: "Evening · Sunset",
      },
    ],
    overnight: {
      key: "d7-hotel",
      query: "7112 Victoria Drive, Vancouver, BC V5P 3Z1",
      type: "hotel",
      notes: "Victoria Dr Airbnb",
    },
  },
  {
    dayIndex: 8,
    date: "2026-08-08",
    title: "Day 8 – Vancouver → Sea-to-Sky → Vancouver",
    routeSummary: "~250 km",
    notes: "Mountain and water · Saturday",
    stops: [
      {
        key: "d8-capilano",
        query: "Capilano Suspension Bridge Park, North Vancouver, BC",
        type: "attraction",
        notes: "Morning",
      },
      {
        key: "d8-shannon",
        query: "Shannon Falls Provincial Park, Squamish, BC",
        type: "attraction",
        notes: "Mid-day · Sea to Sky Highway",
      },
      {
        key: "d8-gondola",
        query: "Sea to Sky Gondola, Squamish, BC",
        type: "attraction",
        notes: "Mid-day",
      },
      {
        key: "d8-mamquam",
        query: "Mamquam Falls, Squamish, BC",
        type: "attraction",
        optional: true,
        notes: "Afternoon · quick stop",
      },
      {
        key: "d8-brandywine",
        query: "Brandywine Falls Provincial Park, BC",
        type: "attraction",
        optional: true,
        notes: "Afternoon · en route to Whistler",
      },
      {
        key: "d8-whistler",
        query: "Whistler Village, Whistler, BC",
        type: "attraction",
        notes: "Afternoon",
      },
      {
        key: "d8-green",
        query: "Green Lake, Whistler, BC",
        type: "attraction",
        notes: "Afternoon",
      },
    ],
    overnight: {
      key: "d8-hotel",
      query: "7112 Victoria Drive, Vancouver, BC V5P 3Z1",
      type: "hotel",
      notes: "Victoria Dr Airbnb",
    },
  },
  {
    dayIndex: 9,
    date: "2026-08-09",
    title: "Day 9 – Vancouver → Victoria → Vancouver",
    routeSummary: "Ferry + driving",
    notes:
      "Island day trip · 7:00 AM Tsawwassen → Swartz Bay · late evening ferry return",
    stops: [
      {
        key: "d9-tsawwassen",
        query: "Tsawwassen Ferry Terminal, Delta, BC",
        type: "transit",
        notes: "7:00 AM ferry · BC Ferries",
      },
      {
        key: "d9-butchart",
        query: "Butchart Gardens, Brentwood Bay, BC",
        type: "attraction",
        notes: "Morning · beat afternoon tour buses",
      },
      {
        key: "d9-harbour",
        query: "Inner Harbour, Victoria, BC",
        type: "attraction",
        notes: "Afternoon · Inner Harbour & pathway",
      },
      {
        key: "d9-parliament",
        query: "British Columbia Parliament Buildings, Victoria, BC",
        type: "attraction",
        notes: "Afternoon",
      },
      {
        key: "d9-tolmie",
        query: "Mount Tolmie Park, Victoria, BC",
        type: "attraction",
        notes: "Late afternoon · Lookout",
      },
      {
        key: "d9-swartz",
        query: "Swartz Bay Ferry Terminal, Sidney, BC",
        type: "transit",
        notes: "Evening ferry back to Vancouver",
      },
    ],
    overnight: {
      key: "d9-hotel",
      query: "7112 Victoria Drive, Vancouver, BC V5P 3Z1",
      type: "hotel",
      notes: "Victoria Dr Airbnb",
    },
  },
  {
    dayIndex: 10,
    date: "2026-08-10",
    title: "Day 10 – Vancouver → Clearwater",
    routeSummary: "~500 km · 5.5–7 hrs",
    notes:
      "Water adventures & waterfalls · Morning English Bay water sports · Afternoon Wells Gray falls (clears Day 11 for the long drive)",
    stops: [
      {
        key: "d10-water",
        query: "English Bay Beach, Vancouver, BC",
        type: "attraction",
        notes: "Morning · Kayak, paddleboard, jet ski, or boat",
      },
      {
        key: "d10-spahats",
        query: "Spahats Creek Falls, Clearwater, BC",
        type: "attraction",
        notes: "Afternoon · Wells Gray Park",
      },
      {
        key: "d10-helmcken",
        query: "Helmcken Falls, Wells Gray Provincial Park, BC",
        type: "attraction",
        notes: "Afternoon · Wells Gray Park",
      },
      {
        key: "d10-dawson",
        query: "Dawson Falls, Wells Gray Provincial Park, BC",
        type: "attraction",
        notes: "Afternoon · Wells Gray Park",
      },
    ],
    overnight: {
      key: "d10-hotel",
      query: "4081 McNab Road, Clearwater, BC V0E 2C0",
      type: "hotel",
      notes: "McNab Rd Holiday Home",
    },
  },
  {
    dayIndex: 11,
    date: "2026-08-11",
    title: "Day 11 – Clearwater → Edmonton",
    routeSummary: "~700 km · 7–8 hrs",
    notes:
      "The great transit day · Early checkout · Focus on the highway drive (waterfalls done on Day 10)",
    stops: [
      {
        key: "d11-drive",
        query: "Yellowhead Highway, BC",
        type: "custom",
        notes: "All-day highway drive to Alberta · rest stops as needed",
      },
      {
        key: "d11-legislature",
        query: "Alberta Legislature Building, Edmonton, AB, Canada",
        type: "attraction",
        notes: "Evening · Arrive & relax near Legislature",
      },
    ],
    overnight: {
      key: "d11-hotel",
      query: "Alberta Legislature Building, Edmonton, AB, Canada",
      type: "city_overnight",
      notes: "City overnight — Edmonton (Legislature Building TBD)",
    },
  },
  {
    dayIndex: 12,
    date: "2026-08-12",
    title: "Day 12 – Edmonton → Saskatoon",
    routeSummary: "~525 km · 5–6 hrs",
    notes:
      "The prairie return · Leisurely drive with rest stops in Lloydminster and North Battleford",
    stops: [
      {
        key: "d12-lloyd",
        query: "Lloydminster, SK",
        type: "attraction",
        optional: true,
        notes: "Rest stop",
      },
      {
        key: "d12-battleford",
        query: "North Battleford, SK",
        type: "attraction",
        optional: true,
        notes: "Rest stop",
      },
      {
        key: "d12-remai",
        query: "Remai Modern, Saskatoon, SK, Canada",
        type: "attraction",
        notes: "Evening · Unwind near Remai Modern",
      },
    ],
    overnight: {
      key: "d12-hotel",
      query: "Remai Modern, Saskatoon, SK, Canada",
      type: "city_overnight",
      notes: "City overnight — Saskatoon (Remai Modern TBD)",
    },
  },
  {
    dayIndex: 13,
    date: "2026-08-13",
    title: "Day 13 – Flight home",
    routeSummary: "~1 hr on-site",
    notes: "End of trip · Milton family boards flights home to Toronto",
    stops: [
      {
        key: "d13-airport",
        query: "Saskatoon John G. Diefenbaker International Airport",
        type: "transit",
        notes: "Morning · Flight home to Toronto",
      },
    ],
  },
];
