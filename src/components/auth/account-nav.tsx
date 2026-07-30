import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const NAV: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: "/account", label: "Overview", exact: true },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/email", label: "Email" },
  { href: "/account/password", label: "Password" },
  { href: "/account/sessions", label: "Sessions" },
];

export function AccountNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto pb-1">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
