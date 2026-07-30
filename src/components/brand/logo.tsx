import { cn } from "@/lib/utils/cn";

type MarkProps = {
  className?: string;
  tone?: "brand" | "light" | "dark";
};

const tones = {
  brand: {
    plate: "var(--spruce)",
    ridge: "var(--accent)",
    road: "var(--map-route)",
    dash: "var(--background)",
  },
  light: {
    plate: "var(--background)",
    ridge: "var(--primary)",
    road: "var(--spruce)",
    dash: "var(--accent)",
  },
  dark: {
    plate: "var(--spruce)",
    ridge: "var(--accent)",
    road: "var(--map-route)",
    dash: "var(--background)",
  },
} as const;

export function LogoMark({ className = "h-10 w-10", tone = "brand" }: MarkProps) {
  const c = tones[tone];
  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      role="img"
      aria-label="RoadPlan Studio"
    >
      <rect width="128" height="128" rx="30" fill={c.plate} />
      <path
        d="M18 96 L48 42 L66 74"
        fill="none"
        stroke={c.ridge}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M62 96 L88 48 L112 92"
        fill="none"
        stroke={c.ridge}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />
      <path
        d="M30 112 C 52 96, 40 74, 62 62 C 84 50, 74 32, 98 20"
        fill="none"
        stroke={c.road}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M30 112 C 52 96, 40 74, 62 62 C 84 50, 74 32, 98 20"
        fill="none"
        stroke={c.dash}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="9 11"
      />
    </svg>
  );
}

export function Wordmark({
  className = "",
  size = "md",
  tone = "brand",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: "brand" | "light" | "dark";
}) {
  const sizes = {
    sm: {
      mark: "h-8 w-8",
      title: "text-lg",
      sub: "text-[9px] tracking-[0.32em]",
    },
    md: {
      mark: "h-10 w-10",
      title: "text-xl",
      sub: "text-[10px] tracking-[0.32em]",
    },
    lg: {
      mark: "h-14 w-14",
      title: "text-3xl",
      sub: "text-[11px] tracking-[0.34em]",
    },
  }[size];

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-3", className)}>
      <LogoMark className={cn(sizes.mark, "shrink-0")} tone={tone} />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-display font-semibold tracking-tight",
            sizes.title,
          )}
        >
          RoadPlan
        </span>
        <span
          className={cn(
            "mt-1 font-medium uppercase text-muted-foreground",
            sizes.sub,
          )}
        >
          Studio
        </span>
      </span>
    </span>
  );
}

export { Wordmark as Logo };
