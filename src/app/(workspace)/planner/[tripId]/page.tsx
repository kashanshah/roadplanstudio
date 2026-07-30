import type { Metadata } from "next";
import { PlannerShell } from "@/components/planner/planner-shell";

type Props = {
  params: Promise<{ tripId: string }>;
};

export const metadata: Metadata = {
  title: "Planner",
  robots: { index: false, follow: false },
};

export default async function PlannerPage({ params }: Props) {
  const { tripId } = await params;
  return <PlannerShell tripId={tripId} />;
}
