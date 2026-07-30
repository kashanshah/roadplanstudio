export const SITE_URL = "https://www.roadplanstudio.com";
export const SITE_NAME = "RoadPlan Studio";
export const SITE_DESCRIPTION =
  "Plan premium multi-day road trips with maps, itineraries, and tripmates — from idea to open road.";

export const PUBLIC_ROUTES = ["/", "/discover", "/trips"] as const;
export const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
] as const;
export const PROTECTED_ROUTES = ["/account", "/auth/profile", "/planner"] as const;
