import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/discover"
            className="hidden rounded-md px-3 py-2 text-sm text-snow/90 transition hover:text-snow sm:inline-flex"
          >
            Discover
          </Link>
          <Link
            href="/auth/login"
            className="rounded-md px-3 py-2 text-sm text-snow/90 transition hover:text-snow"
          >
            Sign in
          </Link>
          <Link
            href="/planner/new"
            className="rounded-md bg-sandstone px-3 py-2 text-sm font-medium text-spruce transition hover:bg-sandstone/90"
          >
            Start planning
          </Link>
          <ThemeToggle className="border-white/20 bg-white/10 text-snow hover:bg-white/20" />
        </nav>
      </div>
    </header>
  );
}
