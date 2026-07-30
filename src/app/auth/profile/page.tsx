import { redirect } from "next/navigation";

/** Legacy route — account hub lives at /account. */
export default function LegacyProfilePage() {
  redirect("/account");
}
