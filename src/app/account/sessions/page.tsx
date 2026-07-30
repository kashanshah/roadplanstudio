import type { Metadata } from "next";
import { SessionsSecurityForm } from "@/components/auth/sessions-security-form";

export const metadata: Metadata = {
  title: "Sessions & security",
  robots: { index: false, follow: false },
};

export default function AccountSessionsPage() {
  return <SessionsSecurityForm />;
}
