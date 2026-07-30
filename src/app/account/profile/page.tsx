import type { Metadata } from "next";
import { ProfilePreferencesForm } from "@/components/auth/profile-preferences-form";
import { getSession } from "@/lib/auth-server";
import { ensureProfile } from "@/lib/trips/ensure-profile";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function AccountProfilePage() {
  const session = await getSession();
  if (!session) return null;
  const profile = await ensureProfile(session.user);

  return (
    <ProfilePreferencesForm
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
  );
}
