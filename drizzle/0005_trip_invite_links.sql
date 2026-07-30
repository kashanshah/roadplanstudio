CREATE TYPE "public"."join_request_status" AS ENUM('pending', 'approved', 'rejected');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trip_invite_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"token" text NOT NULL,
	"permission" "collaborator_permission" DEFAULT 'VIEWER' NOT NULL,
	"enabled" text DEFAULT 'true' NOT NULL,
	"require_approval" text DEFAULT 'false' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trip_invite_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trip_join_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"invite_link_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"permission" "collaborator_permission" DEFAULT 'VIEWER' NOT NULL,
	"status" "join_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "trip_invite_links_trip_uidx" ON "trip_invite_links" USING btree ("trip_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "trip_join_requests_trip_user_uidx" ON "trip_join_requests" USING btree ("trip_id","user_id");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_invite_links" ADD CONSTRAINT "trip_invite_links_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_invite_links" ADD CONSTRAINT "trip_invite_links_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_join_requests" ADD CONSTRAINT "trip_join_requests_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_join_requests" ADD CONSTRAINT "trip_join_requests_invite_link_id_trip_invite_links_id_fk" FOREIGN KEY ("invite_link_id") REFERENCES "public"."trip_invite_links"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_join_requests" ADD CONSTRAINT "trip_join_requests_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_join_requests" ADD CONSTRAINT "trip_join_requests_resolved_by_profiles_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
