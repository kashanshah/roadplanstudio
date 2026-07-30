DO $$ BEGIN
  CREATE TYPE "public"."time_format" AS ENUM('h12', 'h24');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "time_format" "time_format" DEFAULT 'h12' NOT NULL;
