import type { Metadata } from "next";
import { GuestBanner } from "@/components/layout/guest-banner";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type Props = {
  params: Promise<{ tripId: string }>;
};

export const metadata: Metadata = {
  title: "Planner",
  robots: { index: false, follow: false },
};

export default async function PlannerPage({ params }: Props) {
  const { tripId } = await params;
  const isGuest = tripId === "new";

  return (
    <div className="flex min-h-full flex-col bg-background">
      {isGuest ? <GuestBanner /> : null}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo showWordmark={false} />
            <div>
              <p className="text-sm font-medium text-foreground">
                {isGuest ? "Untitled road trip" : `Trip ${tripId}`}
              </p>
              <p className="text-xs text-muted-foreground">
                Workspace canvas · Phase 1 shell
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:p-6">
        <section className="rounded-lg border border-dashed border-border bg-muted/30 p-6">
          <h1 className="font-display text-2xl text-foreground">Timeline</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Day blocks and dnd-kit reordering land in later phases. Guest state
            will live in React context until cloud sync.
          </p>
        </section>
        <section className="min-h-[420px] rounded-lg border border-dashed border-border bg-muted/30 p-6">
          <h2 className="font-display text-2xl text-foreground">Map</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Full-screen Google Maps loads via <code>next/dynamic</code> with a
            skeleton loader.
          </p>
        </section>
      </main>
    </div>
  );
}
