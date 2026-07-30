import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-full flex-col bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_55%)]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10 sm:px-6">
        <div className="mb-10 flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <h1 className="font-display text-3xl text-foreground">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Save guest trips to the cloud and unlock sharing with tripmates.
        </p>
        <form className="mt-8 space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span>Full name</span>
            <input
              name="fullName"
              type="text"
              autoComplete="name"
              className="w-full rounded-md border border-border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-md border border-border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Create account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
