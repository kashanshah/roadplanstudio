"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Mail } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function VerifyEmailBanner() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [dismissed, setDismissed] = useState(false);

  if (
    isPending ||
    dismissed ||
    !session ||
    session.user.emailVerified ||
    pathname?.startsWith("/auth/verify-email")
  ) {
    return null;
  }

  const href = `/auth/verify-email?email=${encodeURIComponent(session.user.email)}&next=${encodeURIComponent(pathname || "/planner")}`;

  return (
    <div className="border-b border-accent/30 bg-secondary">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-6">
        <div className="flex min-w-0 flex-1 items-start gap-3 text-base sm:items-center sm:text-lg">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>
            <span className="font-medium">Verify your email</span>
            <span className="text-muted-foreground">
              {" "}
              to unlock sharing and tripmate invites. You can keep planning in
              the meantime.
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="text-base">
            <Link href={href}>Enter code</Link>
          </Button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="px-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
