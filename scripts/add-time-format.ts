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
    `DO $$ BEGIN CREATE TYPE "public"."time_format" AS ENUM('h12', 'h24'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  );
  await sql.query(
    `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "time_format" "time_format" DEFAULT 'h12' NOT NULL`,
  );
  const cols = await sql`
    SELECT column_name, udt_name
    FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'time_format'
  `;
  console.log("OK", cols);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
