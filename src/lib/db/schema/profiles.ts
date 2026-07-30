import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "premium"]);
export const distanceUnitEnum = pgEnum("distance_unit", ["km", "mi"]);
export const temperatureUnitEnum = pgEnum("temperature_unit", ["c", "f"]);
export const timeFormatEnum = pgEnum("time_format", ["h12", "h24"]);

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  language: text("language").notNull().default("en"),
  distanceUnit: distanceUnitEnum("distance_unit").notNull().default("km"),
  temperatureUnit: temperatureUnitEnum("temperature_unit")
    .notNull()
    .default("c"),
  /** Personal display preference — not trip-specific. */
  timeFormat: timeFormatEnum("time_format").notNull().default("h12"),
  notificationPrefs: jsonb("notification_prefs")
    .$type<{
      emailMarketing: boolean;
      tripUpdates: boolean;
      collaboratorInvites: boolean;
    }>()
    .notNull()
    .default({
      emailMarketing: false,
      tripUpdates: true,
      collaboratorInvites: true,
    }),
  plan: planEnum("plan").notNull().default("free"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
