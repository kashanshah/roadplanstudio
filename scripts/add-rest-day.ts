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
    `ALTER TABLE "trip_days" ADD COLUMN IF NOT EXISTS "is_rest_day" text DEFAULT 'false' NOT NULL`,
  );
  const cols = await sql`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'trip_days' AND column_name = 'is_rest_day'
  `;
  console.log("OK", cols);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
