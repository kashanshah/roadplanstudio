import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to sync trips across devices and invite tripmates."
    >
      <form className="mt-8 space-y-4">
        <Field label="Email" id="email" type="email" autoComplete="email" />
        <Field
          label="Password"
          id="password"
          type="password"
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-95"
        >
          Sign in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-col bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%)]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10 sm:px-6">
        <div className="mb-10 flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <h1 className="font-display text-3xl text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  type,
  autoComplete,
}: {
  label: string;
  id: string;
  type: string;
  autoComplete?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-foreground">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
      />
    </label>
  );
}
