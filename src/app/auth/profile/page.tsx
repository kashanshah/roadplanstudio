import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl text-foreground">
          Profile details
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update your name and avatar. Wired to Supabase Auth in Phase 2.
        </p>
        <form className="mt-8 max-w-md space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span>Full name</span>
            <input
              name="fullName"
              type="text"
              className="w-full rounded-md border border-border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span>Email</span>
            <input
              name="email"
              type="email"
              disabled
              className="w-full rounded-md border border-border bg-muted px-3 py-2.5 text-muted-foreground"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Save changes
          </button>
        </form>
      </main>
    </div>
  );
}
