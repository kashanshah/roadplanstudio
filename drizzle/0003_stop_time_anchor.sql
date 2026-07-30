DO $$ BEGIN
 CREATE TYPE "public"."stop_time_anchor_type" AS ENUM('arrive_by', 'depart_at');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "itinerary_items" ADD COLUMN IF NOT EXISTS "timing_mode" "stop_time_anchor_type";
--> statement-breakpoint
ALTER TABLE "itinerary_items" ADD COLUMN IF NOT EXISTS "timing_mins" integer;
