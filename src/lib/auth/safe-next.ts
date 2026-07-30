/** Same-origin relative paths only — blocks open redirects. */
export function safeNextPath(
  value: string | null | undefined,
  fallback = "/planner/new",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

/** Invite accept flows — guest-trip claim must not override these. */
export function isInviteReturnPath(path: string): boolean {
  return (
    path.startsWith("/invite/") || path.startsWith("/auth/accept-invite")
  );
}
