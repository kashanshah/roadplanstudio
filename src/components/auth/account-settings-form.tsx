"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient, signOut } from "@/lib/auth-client";

type ProfileData = {
  fullName: string | null;
  phone: string | null;
  language: string;
  distanceUnit: "km" | "mi";
  temperatureUnit: "c" | "f";
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

export function AccountSettingsForm({ email, initial }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: String(form.get("fullName") || ""),
        phone: String(form.get("phone") || "") || null,
        language: String(form.get("language") || "en"),
        distanceUnit: String(form.get("distanceUnit") || "km"),
        temperatureUnit: String(form.get("temperatureUnit") || "c"),
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
    setMessage("Profile saved");
    router.refresh();
  }

  async function onPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const currentPassword = String(form.get("currentPassword") || "");
    const newPassword = String(form.get("newPassword") || "");
    const confirm = String(form.get("confirmPassword") || "");
    if (newPassword !== confirm) {
      setPending(false);
      setError("New passwords do not match");
      return;
    }
    const { error: changeError } = await authClient.changePassword({
      currentPassword,
      newPassword,
    });
    setPending(false);
    if (changeError) {
      setError(changeError.message || "Could not change password");
      return;
    }
    setMessage("Password updated");
    (e.target as HTMLFormElement).reset();
  }

  async function onSignOutAll() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mt-10 space-y-14">
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

      <section>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          Profile
        </h2>
        <form className="mt-6 max-w-md space-y-4" onSubmit={onProfile}>
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
          <div className="grid grid-cols-2 gap-3">
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
              <label key={name} className="flex items-center gap-2 text-muted-foreground">
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
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          Security
        </h2>
        <form className="mt-6 max-w-md space-y-4" onSubmit={onPassword}>
          <label className="block space-y-2 text-base">
            <span className="font-medium">Current password</span>
            <input
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="block space-y-2 text-base">
            <span className="font-medium">New password</span>
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="block space-y-2 text-base">
            <span className="font-medium">Confirm new password</span>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <Button type="submit" disabled={pending} className="text-base">
            Change password
          </Button>
        </form>
        <Button
          type="button"
          variant="secondary"
          className="mt-6 text-base"
          onClick={onSignOutAll}
        >
          Log out
        </Button>
      </section>
    </div>
  );
}
