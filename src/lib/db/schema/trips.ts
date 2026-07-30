import { relations } from "drizzle-orm";
import {
  date,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const visibilityEnum = pgEnum("trip_visibility", [
  "private",
  "unlisted",
  "public",
]);
export const difficultyEnum = pgEnum("trip_difficulty", [
  "easy",
  "moderate",
  "hard",
]);
export const collaboratorPermissionEnum = pgEnum("collaborator_permission", [
  "VIEWER",
  "EDITOR",
]);
export const itemTypeEnum = pgEnum("itinerary_item_type", [
  "attraction",
  "hotel",
  "custom",
]);
export const stopStatusEnum = pgEnum("stop_status", [
  "to_visit",
  "visited",
  "skipped",
  "cancelled",
  "favorite",
]);
export const travelModeEnum = pgEnum("travel_mode", [
  "driving",
  "walking",
  "bicycling",
  "transit",
]);
export const stopTimeAnchorTypeEnum = pgEnum("stop_time_anchor_type", [
  "arrive_by",
  "depart_at",
]);

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug"),
    description: text("description"),
    coverPhotoUrl: text("cover_photo_url"),
    startPlaceId: text("start_place_id"),
    startPlaceName: text("start_place_name"),
    startAddress: text("start_address"),
    startLatitude: doublePrecision("start_latitude"),
    startLongitude: doublePrecision("start_longitude"),
    durationDays: integer("duration_days").notNull().default(1),
    totalDistanceKm: doublePrecision("total_distance_km"),
    difficulty: difficultyEnum("difficulty").notNull().default("moderate"),
    visibility: visibilityEnum("visibility").notNull().default("private"),
    lastEditedBy: text("last_edited_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("trips_slug_uidx").on(t.slug)],
);

export const tripCollaborators = pgTable(
  "trip_collaborators",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    permission: collaboratorPermissionEnum("permission")
      .notNull()
      .default("VIEWER"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("trip_collaborators_trip_user_uidx").on(t.tripId, t.userId)],
);

export const tripInvites = pgTable(
  "trip_invites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    permission: collaboratorPermissionEnum("permission")
      .notNull()
      .default("VIEWER"),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("trip_invites_trip_email_uidx").on(t.tripId, t.email)],
);

export const tripDays = pgTable("trip_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  dayIndex: integer("day_index").notNull(),
  date: date("date"),
  title: text("title").notNull(),
  notes: text("notes"),
  routeSummary: text("route_summary"),
  /** Recovery / zero-travel day (still countable in the itinerary). */
  isRestDay: text("is_rest_day").notNull().default("false"),
});

export const itineraryItems = pgTable("itinerary_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  dayId: uuid("day_id")
    .notNull()
    .references(() => tripDays.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  type: itemTypeEnum("type").notNull().default("attraction"),
  googlePlaceId: text("google_place_id"),
  name: text("name").notNull(),
  address: text("address"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  durationMins: integer("duration_mins"),
  timingMode: stopTimeAnchorTypeEnum("timing_mode"),
  timingMins: integer("timing_mins"),
  customTravelDurationMins: integer("custom_travel_duration_mins"),
  customTravelDistanceKm: doublePrecision("custom_travel_distance_km"),
  /** How you travel from this stop to the next one on the same day. */
  travelMode: travelModeEnum("travel_mode").notNull().default("driving"),
  status: stopStatusEnum("status").notNull().default("to_visit"),
  notes: text("notes"),
  googleMapsUri: text("google_maps_uri"),
});

export const accommodations = pgTable("accommodations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  dayId: uuid("day_id").references(() => tripDays.id, { onDelete: "set null" }),
  googlePlaceId: text("google_place_id"),
  name: text("name").notNull(),
  address: text("address"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  checkInDate: date("check_in_date"),
  checkOutDate: date("check_out_date"),
  bookingDetails: jsonb("booking_details").$type<Record<string, unknown>>(),
  googleMapsUri: text("google_maps_uri"),
  isConfirmed: text("is_confirmed").notNull().default("false"),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amountCents: integer("amount_cents").notNull().default(0),
  currency: text("currency").notNull().default("CAD"),
  category: text("category"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const packingItems = pgTable("packing_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  packed: text("packed").notNull().default("false"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => profiles.userId, {
    onDelete: "set null",
  }),
  action: text("action").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tripsRelations = relations(trips, ({ one, many }) => ({
  owner: one(profiles, {
    fields: [trips.ownerId],
    references: [profiles.userId],
  }),
  collaborators: many(tripCollaborators),
  invites: many(tripInvites),
  days: many(tripDays),
  accommodations: many(accommodations),
  expenses: many(expenses),
  packingItems: many(packingItems),
  activityLogs: many(activityLogs),
}));

export const tripDaysRelations = relations(tripDays, ({ one, many }) => ({
  trip: one(trips, {
    fields: [tripDays.tripId],
    references: [trips.id],
  }),
  items: many(itineraryItems),
}));

export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  day: one(tripDays, {
    fields: [itineraryItems.dayId],
    references: [tripDays.id],
  }),
}));

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
