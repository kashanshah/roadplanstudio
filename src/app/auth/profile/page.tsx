import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountSettingsForm } from "@/components/auth/account-settings-form";
import { SiteNav } from "@/components/layout/site-nav";
import { getSession } from "@/lib/auth-server";
import { ensureProfile } from "@/lib/trips/ensure-profile";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login?next=/auth/profile");
  }

  const profile = await ensureProfile(session.user);

  return (
    <div className="min-h-full bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="eyebrow text-primary">Account</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          Profile &amp; preferences
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Manage how you travel with RoadPlan Studio across every device.
        </p>
        <AccountSettingsForm
          email={session.user.email}
          initial={{
            fullName: profile.fullName,
            phone: profile.phone,
            language: profile.language,
            distanceUnit: profile.distanceUnit,
            temperatureUnit: profile.temperatureUnit,
            notificationPrefs: profile.notificationPrefs,
          }}
        />
      </main>
    </div>
  );
}
