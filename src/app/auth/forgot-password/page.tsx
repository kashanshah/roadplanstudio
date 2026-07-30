import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-full flex-col bg-background">
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10 sm:px-6">
        <div className="mb-10 flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <h1 className="font-display text-3xl text-foreground">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a secure reset link.
        </p>
        <form className="mt-8 space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Send reset link
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/auth/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
