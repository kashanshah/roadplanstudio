ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "start_place_id" text;
--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "start_place_name" text;
--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "start_address" text;
--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "start_latitude" double precision;
--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "start_longitude" double precision;
