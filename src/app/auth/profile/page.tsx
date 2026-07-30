import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login?next=/auth/profile");
  }

  const { user } = session;

  return (
    <div className="min-h-full bg-background">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="eyebrow text-primary">Account</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Profile details
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in with Better Auth. Avatar uploads will use S3 in a later
          pass.
        </p>
        <form className="mt-8 max-w-md space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Name</span>
            <input
              name="name"
              type="text"
              defaultValue={user.name ?? ""}
              className="h-10 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Email</span>
            <input
              name="email"
              type="email"
              disabled
              defaultValue={user.email}
              className="h-10 w-full rounded-full border border-input bg-muted px-4 text-muted-foreground"
            />
          </label>
          <Button type="submit" disabled>
            Save changes (coming soon)
          </Button>
        </form>
      </main>
    </div>
  );
}
