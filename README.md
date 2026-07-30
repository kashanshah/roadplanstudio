# RoadPlan Studio

Premium multi-day road trip planner — [www.roadplanstudio.com](https://www.roadplanstudio.com).

## Stack

- **Next.js** (App Router) + TypeScript on **Vercel**
- **Neon** (Serverless Postgres) + **Drizzle ORM**
- **Better Auth** (sessions in Neon — no Supabase / NextAuth)
- **S3 / R2** for media uploads
- **Resend** for transactional email (password reset, verification, invites)
- **Tailwind CSS**, Framer Motion, TanStack Query, Zod
- **Google Maps** Platform (Places for seed enrichment)

## What's in place

- Public SEO routes: `/`, `/discover`, `/trips/[publicSlug]` (DB-backed when seeded)
- Guest planner: `/planner/new` — no login required
- Auth gate modal for Save / Share / Tripmates
- Auth: login, register, forgot/reset password, account preferences
- Trip APIs: CRUD, claim guest draft, collaborators, email invites
- Western Canada 2026 seed (Google Places–enriched)

## Getting started

```bash
nvm use 22
cp .env.example .env.local
# Fill DATABASE_URL, BETTER_AUTH_SECRET (openssl rand -base64 32), maps keys, RESEND_API_KEY
npm install
npx @better-auth/cli@latest migrate   # Better Auth tables
# Apply app schema (from drizzle/0000_init_app_tables.sql) if not already pushed
npm run seed:enrich-western-canada    # Places API → resolved JSON
npm run seed:western-canada           # Upsert public template trip
npm run dev
```

Add `RESEND_API_KEY` and a verified `EMAIL_FROM` in `.env.local`. Without the key, emails log to the server console (dev fallback).
## Scripts

| Script | Purpose |
|--------|---------|
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push schema to Neon (interactive) |
| `npm run seed:enrich-western-canada` | Resolve stops via Google Places |
| `npm run seed:western-canada` | Seed `/trips/western-canada-2026` |

## Design source

[Pacific Peaks Showcase](https://lovable.dev/projects/4a0f7ef3-96ef-4ac7-b75a-c8a91e3ba3cb) (Lovable credits were exhausted during this pass — UI was built directly in-repo).
