import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type GuestBannerProps = {
  className?: string;
};

export function GuestBanner({ className }: GuestBannerProps) {
  return (
    <div
      className={cn(
        "border-b border-primary/20 bg-primary/10 px-4 py-2.5 text-center text-sm text-foreground",
        className,
      )}
      role="status"
    >
      You&apos;re planning as a guest — data stays in this browser tab.{" "}
      <Link
        href="/auth/register"
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        Sign up to save &amp; share
      </Link>
    </div>
  );
}
