"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  useDisplayPrefs,
  type TimeFormat,
} from "@/lib/prefs/display-prefs";

type ProfileData = {
  fullName: string | null;
  phone: string | null;
  language: string;
  distanceUnit: "km" | "mi";
  temperatureUnit: "c" | "f";
  timeFormat: "h12" | "h24";
  notificationPrefs: {
    emailMarketing: boolean;
    tripUpdates: boolean;
    collaboratorInvites: boolean;
  };
};

type Props = {
  email: string;
  initial: ProfileData;
};

export function ProfilePreferencesForm({ email, initial }: Props) {
  const router = useRouter();
  const { setTimeFormat } = useDisplayPrefs();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const timeFormat = (String(form.get("timeFormat") || "h12") === "h24"
      ? "h24"
      : "h12") as TimeFormat;
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: String(form.get("fullName") || ""),
        phone: String(form.get("phone") || "") || null,
        language: String(form.get("language") || "en"),
        distanceUnit: String(form.get("distanceUnit") || "km"),
        temperatureUnit: String(form.get("temperatureUnit") || "c"),
        timeFormat,
        notificationPrefs: {
          emailMarketing: form.get("emailMarketing") === "on",
          tripUpdates: form.get("tripUpdates") === "on",
          collaboratorInvites: form.get("collaboratorInvites") === "on",
        },
      }),
    });
    setPending(false);
    if (!res.ok) {
      setError("Could not save profile");
      return;
    }
    setTimeFormat(timeFormat);
    setMessage("Profile saved");
    router.refresh();
  }

  return (
    <div className="max-w-md space-y-4">
      {message ? (
        <p className="text-base text-primary" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-base text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <form className="space-y-4" onSubmit={onProfile}>
        <label className="block space-y-2 text-base">
          <span className="font-medium">Name</span>
          <input
            name="fullName"
            type="text"
            defaultValue={initial.fullName ?? ""}
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-2 text-base">
          <span className="font-medium">Email</span>
          <input
            type="email"
            disabled
            defaultValue={email}
            className="h-12 w-full rounded-full border border-input bg-muted px-4 text-muted-foreground"
          />
          <span className="block text-sm text-muted-foreground">
            Change email from the{" "}
            <a href="/account/email" className="text-primary underline-offset-4 hover:underline">
              Email
            </a>{" "}
            tab.
          </span>
        </label>
        <label className="block space-y-2 text-base">
          <span className="font-medium">Phone (optional)</span>
          <input
            name="phone"
            type="tel"
            defaultValue={initial.phone ?? ""}
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-2 text-base">
          <span className="font-medium">Language</span>
          <select
            name="language"
            defaultValue={initial.language}
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block space-y-2 text-base">
            <span className="font-medium">Distance</span>
            <select
              name="distanceUnit"
              defaultValue={initial.distanceUnit}
              className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="km">Kilometers</option>
              <option value="mi">Miles</option>
            </select>
          </label>
          <label className="block space-y-2 text-base">
            <span className="font-medium">Temperature</span>
            <select
              name="temperatureUnit"
              defaultValue={initial.temperatureUnit}
              className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="c">Celsius</option>
              <option value="f">Fahrenheit</option>
            </select>
          </label>
        </div>
        <label className="block space-y-2 text-base">
          <span className="font-medium">Time format</span>
          <select
            name="timeFormat"
            defaultValue={initial.timeFormat}
            className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="h12">12-hour (AM/PM)</option>
            <option value="h24">24-hour</option>
          </select>
          <span className="block text-sm text-muted-foreground">
            Applies to itinerary clocks across all your trips.
          </span>
        </label>
        <fieldset className="space-y-2 text-base">
          <legend className="font-medium">Notifications</legend>
          {(
            [
              ["tripUpdates", "Trip updates", initial.notificationPrefs.tripUpdates],
              [
                "collaboratorInvites",
                "Collaborator invites",
                initial.notificationPrefs.collaboratorInvites,
              ],
              [
                "emailMarketing",
                "Product news",
                initial.notificationPrefs.emailMarketing,
              ],
            ] as const
          ).map(([name, label, checked]) => (
            <label
              key={name}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <input
                name={name}
                type="checkbox"
                defaultChecked={checked}
                className="size-4 rounded border-input"
              />
              {label}
            </label>
          ))}
        </fieldset>
        <Button type="submit" disabled={pending} className="text-base">
          {pending ? "Saving…" : "Save preferences"}
        </Button>
      </form>
    </div>
  );
}
