"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  KeyRound,
  LogOut,
  Mail,
  Settings,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils/cn";

type Props = {
  tone?: "default" | "onDark" | "compact";
  className?: string;
};

export function AccountMenu({ tone = "default", className }: Props) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (isPending) {
    return (
      <div
        className={cn(
          "h-9 w-20 animate-pulse rounded-full bg-secondary/80",
          className,
        )}
      />
    );
  }

  if (!session) {
    return (
      <Button
        asChild
        size="sm"
        variant={tone === "onDark" ? "onDark" : "default"}
        className={cn(
          "inline-flex items-center justify-center leading-none",
          tone === "compact" ? "hidden sm:inline-flex" : "",
          className,
        )}
      >
        <Link href={`/auth/login?next=${encodeURIComponent(pathname || "/")}`}>
          Sign in
        </Link>
      </Button>
    );
  }

  const label =
    session.user.name?.split(" ")[0] ||
    session.user.email.split("@")[0] ||
    "Account";

  async function onLogout() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex h-9 max-w-[10rem] items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors",
          tone === "onDark"
            ? "border border-snow/25 bg-snow/10 text-snow hover:bg-snow/20"
            : "border border-border bg-card text-foreground hover:bg-secondary",
        )}
      >
        <UserRound className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 opacity-70 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-elevated"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium text-popover-foreground">
              {session.user.name || "Your account"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {session.user.email}
            </p>
          </div>
          <Link
            href="/account"
            role="menuitem"
            className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-popover-foreground hover:bg-secondary"
          >
            <Settings className="size-4" />
            Account settings
          </Link>
          <Link
            href="/account/email"
            role="menuitem"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-popover-foreground hover:bg-secondary"
          >
            <Mail className="size-4" />
            Change email
          </Link>
          <Link
            href="/account/password"
            role="menuitem"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-popover-foreground hover:bg-secondary"
          >
            <KeyRound className="size-4" />
            Change password
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            onClick={() => void onLogout()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-destructive hover:bg-secondary"
          >
            <LogOut className="size-4" />
            {signingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
