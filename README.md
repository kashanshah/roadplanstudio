# RoadPlan Studio

Premium multi-day road trip planner — [www.roadplanstudio.com](https://www.roadplanstudio.com).

## Stack

- **Next.js** (App Router) + TypeScript
- **Vercel** deployment target
- **Neon** (Serverless Postgres) — Phase 3
- **Supabase** Auth & Storage
- **Tailwind CSS**, Framer Motion, TanStack Query, Zod

## Phase 1 (current)

- Public routes: `/`, `/discover`, `/trips/[publicSlug]`
- Workspace: `/planner/[tripId]` (guest-friendly)
- Auth shells: `/auth/login`, `/register`, `/forgot-password`, `/profile`
- Email template previews: `/emails`
- Dual theme (light/dark), brand assets in `/public/brand`
- Supabase session middleware guards

## Getting started

```bash
# Node 20.9+ recommended (nvm use 22)
cp .env.example .env.local
npm install
npm run dev
```

## Design source

Lovable design lab: [Pacific Peaks Showcase](https://lovable.dev/projects/4a0f7ef3-96ef-4ac7-b75a-c8a91e3ba3cb)
