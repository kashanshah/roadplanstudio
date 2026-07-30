import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m && !process.env[m[1].trim()]) {
    process.env[m[1].trim()] = m[2].trim();
  }
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql.query(
    `DO $$ BEGIN CREATE TYPE "public"."travel_mode" AS ENUM('driving', 'walking', 'bicycling', 'transit'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  );
  await sql.query(
    `ALTER TABLE "itinerary_items" ADD COLUMN IF NOT EXISTS "travel_mode" "travel_mode" DEFAULT 'driving' NOT NULL`,
  );
  const cols = await sql`
    SELECT column_name, udt_name, column_default
    FROM information_schema.columns
    WHERE table_name = 'itinerary_items' AND column_name = 'travel_mode'
  `;
  console.log("OK", cols);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
