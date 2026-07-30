import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export default async function PlannerIndexPage() {
  const session = await getSession();

  if (session) {
    try {
      const [latest] = await db
        .select({ id: trips.id })
        .from(trips)
        .where(eq(trips.ownerId, session.user.id))
        .orderBy(desc(trips.updatedAt))
        .limit(1);

      if (latest) {
        redirect(`/planner/${latest.id}`);
      }
    } catch {
      // fall through to new draft
    }
  }

  redirect("/planner/new");
}
