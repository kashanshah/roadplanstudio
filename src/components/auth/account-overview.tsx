"use client";

import Link from "next/link";
import { KeyRound, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

const CARDS = [
  {
    href: "/account/profile",
    title: "Profile & preferences",
    body: "Name, units, language, and notification preferences.",
    icon: UserRound,
  },
  {
    href: "/account/email",
    title: "Email address",
    body: "Change your login email with a two-step verification.",
    icon: Mail,
  },
  {
    href: "/account/password",
    title: "Password",
    body: "Update your password and sign out other devices.",
    icon: KeyRound,
  },
  {
    href: "/account/sessions",
    title: "Sessions & security",
    body: "Log out of this device or delete your account.",
    icon: ShieldCheck,
  },
] as const;

export function AccountOverview() {
  const { data: session } = useSession();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function onLogout() {
    setSigningOut(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-primary">
          Current account
        </p>
        <p className="mt-2 text-xl font-semibold">
          {session?.user.name || "Traveler"}
        </p>
        <p className="mt-1 text-base text-muted-foreground">
          {session?.user.email}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {session?.user.emailVerified
            ? "Email verified"
            : "Email not verified yet — verify to unlock sharing."}
        </p>
        {!session?.user.emailVerified ? (
          <Button asChild variant="secondary" size="sm" className="mt-4">
            <Link
              href={`/auth/verify-email?email=${encodeURIComponent(session?.user.email || "")}&next=/account`}
            >
              Verify email
            </Link>
          </Button>
        ) : null}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {CARDS.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/40"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                <card.icon className="size-5" />
              </span>
              <p className="mt-4 text-lg font-semibold">{card.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {card.body}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-dashed border-border p-5">
        <p className="font-medium">Done planning for now?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Log out of this browser. Your cloud trips stay saved.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          disabled={signingOut}
          onClick={() => void onLogout()}
        >
          <LogOut className="size-4" />
          {signingOut ? "Signing out…" : "Log out"}
        </Button>
      </div>
    </div>
  );
}
