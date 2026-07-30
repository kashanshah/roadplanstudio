import type { Metadata } from "next";
import {
  GuestSyncSuccessEmail,
  PasswordResetEmail,
  TripInviteEmail,
  WelcomeEmail,
} from "@/emails/templates";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const metadata: Metadata = {
  title: "Email templates",
  robots: { index: false, follow: false },
};

const previews = [
  { id: "welcome", title: "Welcome / confirm", node: <WelcomeEmail /> },
  {
    id: "reset",
    title: "Password reset",
    node: <PasswordResetEmail />,
  },
  {
    id: "invite",
    title: "Trip invite",
    node: <TripInviteEmail />,
  },
  {
    id: "sync",
    title: "Guest → cloud sync",
    node: <GuestSyncSuccessEmail />,
  },
] as const;

export default function EmailsPreviewPage() {
  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6">
        <div>
          <h1 className="font-display text-3xl text-foreground">
            Email templates
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Brand-aligned transactional emails for auth and collaboration.
          </p>
        </div>
        {previews.map((preview) => (
          <section key={preview.id} className="space-y-3">
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              {preview.title}
            </h2>
            <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
              {preview.node}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
