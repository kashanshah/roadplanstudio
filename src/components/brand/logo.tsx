"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

type LogoProps = {
  className?: string;
  href?: string;
  showWordmark?: boolean;
};

export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const src = showWordmark
    ? isDark
      ? "/brand/logo-dark.svg"
      : "/brand/logo.svg"
    : "/brand/logo-mark.svg";

  const content = (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={src}
        alt="RoadPlan Studio"
        width={showWordmark ? 168 : 36}
        height={showWordmark ? 24 : 36}
        priority
        className={cn(showWordmark ? "h-6 w-auto" : "size-9")}
      />
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center focus-visible:outline-none">
      {content}
    </Link>
  );
}
