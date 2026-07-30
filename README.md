# RoadPlan Studio

Premium multi-day road trip planner — [www.roadplanstudio.com](https://www.roadplanstudio.com).

## Stack

- **Next.js** (App Router) + TypeScript
- **Vercel** deployment target
- **Neon** (Serverless Postgres) + Drizzle ORM
- **Better Auth** (sessions in Neon — no Supabase / NextAuth)
- **S3 / R2** for media uploads
- **Tailwind CSS**, Framer Motion, TanStack Query, Zod
- **Google Maps** Platform

## Phase 1–2 (current)

- Public routes: `/`, `/discover`, `/trips/[publicSlug]`
- Workspace: `/planner/[tripId]` (guest-friendly)
- Auth: `/auth/login`, `/register`, `/forgot-password`, `/profile` via Better Auth
- Email template previews: `/emails`
- Dual theme + brand assets in `/public/brand`

## Getting started

```bash
nvm use 22
cp .env.example .env.local
# Fill DATABASE_URL, BETTER_AUTH_SECRET (openssl rand -base64 32), maps keys
npm install
npx @better-auth/cli@latest migrate   # creates auth tables in Neon
npm run dev
```

## Design source (Lovable)

[Pacific Peaks Showcase](https://lovable.dev/projects/4a0f7ef3-96ef-4ac7-b75a-c8a91e3ba3cb)
