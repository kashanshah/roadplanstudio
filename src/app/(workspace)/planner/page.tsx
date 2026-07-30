import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MyTripsLibrary } from "@/components/trips/my-trips-library";
import { getSession } from "@/lib/auth-server";
import { listUserTrips } from "@/lib/trips/list-user-trips";

export const metadata: Metadata = {
  title: "Your trips",
  robots: { index: false, follow: false },
};

export default async function PlannerIndexPage() {
  const session = await getSession();

  if (!session) {
    redirect("/planner/new");
  }

  let trips: Awaited<ReturnType<typeof listUserTrips>> = [];
  try {
    trips = await listUserTrips(session.user.id);
  } catch {
    trips = [];
  }

  return <MyTripsLibrary trips={trips} />;
}
