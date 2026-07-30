ALTER TABLE "itinerary_items" ADD COLUMN IF NOT EXISTS "custom_travel_duration_mins" integer;
--> statement-breakpoint
ALTER TABLE "itinerary_items" ADD COLUMN IF NOT EXISTS "custom_travel_distance_km" double precision;
