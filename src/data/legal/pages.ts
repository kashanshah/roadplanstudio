export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalPage = {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

export const legalPages: LegalPage[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    description:
      "Terms governing use of RoadPlan Studio’s website, planner, templates, and collaboration features.",
    updatedAt: "2026-07-30",
    sections: [
      {
        heading: "Agreement",
        paragraphs: [
          "By accessing www.roadplanstudio.com or using RoadPlan Studio (“Service”), you agree to these Terms of Service. If you do not agree, do not use the Service.",
          "RoadPlan Studio helps you plan multi-day road trips with maps, itineraries, and tripmates. It does not replace official road, border, weather, visa, insurance, or travel advisories.",
        ],
      },
      {
        heading: "Accounts & eligibility",
        paragraphs: [
          "You may use guest mode without an account. Cloud sync, sharing, and collaboration require registration via Better Auth.",
          "You are responsible for safeguarding credentials and for activity under your account. Notify us promptly of unauthorized access via the contact form.",
        ],
      },
      {
        heading: "Your content",
        paragraphs: [
          "You retain ownership of itineraries, notes, and media you create. You grant RoadPlan Studio a limited license to host, display, and process that content solely to operate the Service.",
          "Do not upload unlawful, infringing, or harmful material. Public templates and public trips may be indexed for discovery; private trips remain restricted to you and invited collaborators.",
        ],
      },
      {
        heading: "Acceptable use",
        paragraphs: [
          "You agree not to abuse the Service: no scraping at abusive rates, no attempts to disrupt infrastructure, no impersonation, and no use that violates applicable law.",
          "Additional rules appear in our Acceptable Use Policy.",
        ],
      },
      {
        heading: "Third-party services",
        paragraphs: [
          "Maps and place data may use Google Maps Platform APIs, subject to Google’s terms. Email may be sent via Resend. Hosting runs on Vercel with Neon PostgreSQL and S3-compatible storage.",
          "We are not responsible for third-party outages, pricing, or policy changes that affect map or mail features.",
        ],
      },
      {
        heading: "Disclaimers & limitation of liability",
        paragraphs: [
          "The Service is provided “as is.” Drive times, distances, and template suggestions are estimates. Always verify conditions before travel.",
          "To the fullest extent permitted by law, RoadPlan Studio is not liable for indirect, incidental, or consequential damages arising from use of the Service.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "We may update these Terms. Material changes will be reflected by the “Last updated” date on this page. Continued use after updates constitutes acceptance.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Questions about these Terms: use the contact form with topic “support,” or email the address listed on our Contact page.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description:
      "How RoadPlan Studio collects, stores, and uses account, trip, and contact data.",
    updatedAt: "2026-07-30",
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          "RoadPlan Studio operates www.roadplanstudio.com. This Privacy Policy explains what personal data we process when you browse, plan trips, create an account, or contact us.",
        ],
      },
      {
        heading: "Data we collect",
        paragraphs: [
          "Account data: name, email, session tokens, and optional profile preferences (such as time format) via Better Auth, stored in Neon PostgreSQL.",
          "Trip content: days, stops, lodging, notes, collaborator emails, and visibility settings you create.",
          "Media: optional cover photos or avatars uploaded to S3-compatible storage via pre-signed URLs.",
          "Communications: messages sent through Contact or Request a Feature forms.",
          "Technical data: standard server logs and cookies needed for sessions, preferences, and security. See our Cookie Policy.",
        ],
      },
      {
        heading: "Guest mode",
        paragraphs: [
          "Guest itineraries stay in your browser until you claim them into an account. Clearing site data removes guest state. We do not treat ephemeral guest canvas data as a cloud account profile.",
        ],
      },
      {
        heading: "How we use data",
        paragraphs: [
          "We use data to provide planning features, authenticate sessions, send transactional email (verification, invites, resets), improve reliability, and respond to support requests.",
          "We do not sell personal data. We do not use trip content to train public AI models.",
        ],
      },
      {
        heading: "Sharing",
        paragraphs: [
          "Processors that help us run the Service include hosting (Vercel), database (Neon), object storage (S3/R2), email (Resend), and maps (Google Maps Platform) when you use location features.",
          "We may disclose information if required by law or to protect the Service and users from fraud or abuse.",
        ],
      },
      {
        heading: "Retention & security",
        paragraphs: [
          "We retain account and trip data while your account is active and for a reasonable period afterward for backups and legal obligations. You may request deletion via the contact form.",
          "We apply industry-standard safeguards; no method of transmission or storage is perfectly secure.",
        ],
      },
      {
        heading: "International users",
        paragraphs: [
          "RoadPlan Studio is designed for international travelers. Your data may be processed in the United States or other regions where our providers operate. Where required, we rely on appropriate transfer safeguards offered by those providers.",
        ],
      },
      {
        heading: "Your choices",
        paragraphs: [
          "You can update profile preferences in Account settings, revoke sessions, and control trip visibility (private vs public). For access, correction, or deletion requests, contact us with topic “support.”",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Privacy questions: use the contact form. We aim to respond within a reasonable period.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    description:
      "Cookies and similar technologies used by RoadPlan Studio for sessions, preferences, and security.",
    updatedAt: "2026-07-30",
    sections: [
      {
        heading: "What we use",
        paragraphs: [
          "RoadPlan Studio uses cookies and similar storage primarily for authentication sessions (Better Auth), theme and display preferences, and language continuity where applicable.",
        ],
      },
      {
        heading: "Essential cookies",
        paragraphs: [
          "Session cookies keep you signed in and protect authenticated routes such as Account and Planner. These are required for cloud features to function.",
        ],
      },
      {
        heading: "Preference storage",
        paragraphs: [
          "We may store appearance (light/dark) and time-format preferences locally so the planner feels consistent across visits. Guest trip drafts may also use browser storage until claimed.",
        ],
      },
      {
        heading: "Analytics & advertising",
        paragraphs: [
          "We do not currently run third-party advertising cookies on the marketing site. If we add privacy-respecting analytics later, this policy will be updated with details and opt-out options where required.",
        ],
      },
      {
        heading: "Managing cookies",
        paragraphs: [
          "You can clear or block cookies in your browser. Blocking essential cookies may prevent sign-in and cloud sync. Clearing site data removes guest itineraries stored locally.",
        ],
      },
    ],
  },
  {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    description:
      "Rules for fair use of RoadPlan Studio’s planner, APIs, templates, and collaboration tools.",
    updatedAt: "2026-07-30",
    sections: [
      {
        heading: "Purpose",
        paragraphs: [
          "This Acceptable Use Policy explains prohibited and discouraged behavior on RoadPlan Studio so the Service stays reliable for travelers and tripmates.",
        ],
      },
      {
        heading: "Prohibited activities",
        paragraphs: [
          "Do not attempt unauthorized access to accounts, databases, or infrastructure.",
          "Do not overload the Service with automated scraping, bulk account creation, or abusive API-like traffic.",
          "Do not upload malware, phishing content, or illegal material.",
          "Do not harass other users through invites, comments, or shared trip content.",
          "Do not misrepresent affiliation with RoadPlan Studio.",
        ],
      },
      {
        heading: "Maps & rate limits",
        paragraphs: [
          "Place search and directions depend on third-party quotas. Excessive automated querying may be throttled or blocked to protect the Service and provider limits.",
        ],
      },
      {
        heading: "Enforcement",
        paragraphs: [
          "We may suspend or terminate accounts that violate this policy, and we may remove content that puts users or the platform at risk.",
        ],
      },
    ],
  },
  {
    slug: "copyright",
    title: "Copyright & Intellectual Property",
    description:
      "Ownership of RoadPlan Studio software, brand assets, and how to report infringement.",
    updatedAt: "2026-07-30",
    sections: [
      {
        heading: "Our intellectual property",
        paragraphs: [
          "RoadPlan Studio, the wordmark, logos, UI design, and original editorial content are owned by RoadPlan Studio or its licensors. You may not copy the product UI or brand assets for competing services without permission.",
        ],
      },
      {
        heading: "Your itineraries",
        paragraphs: [
          "You own the trip content you create. Public templates seeded by RoadPlan Studio may be remixed under these Terms; attribution in the product is appreciated but not required for personal remixes.",
        ],
      },
      {
        heading: "Third-party map data",
        paragraphs: [
          "Map tiles, place names, and related data may be provided by Google or other providers and remain subject to their intellectual-property and acceptable-use terms.",
        ],
      },
      {
        heading: "Infringement reports",
        paragraphs: [
          "If you believe content on RoadPlan Studio infringes your copyright, contact us via the contact form with: your contact details, a description of the work, the URL of the allegedly infringing material, and a good-faith statement of ownership.",
          "We will review notices and remove or restrict material when appropriate.",
        ],
      },
    ],
  },
];

export function getLegalPage(slug: string) {
  return legalPages.find((p) => p.slug === slug) ?? null;
}

export const legalNav = legalPages.map((p) => ({
  slug: p.slug,
  title: p.title,
  href: `/${p.slug === "terms" ? "terms" : p.slug === "privacy" ? "privacy" : p.slug}`,
}));

/** Canonical path for each legal slug. */
export function legalPath(slug: string) {
  if (slug === "terms") return "/terms";
  if (slug === "privacy") return "/privacy";
  return `/${slug}`;
}
