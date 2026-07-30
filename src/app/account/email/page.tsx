import type { Metadata } from "next";
import { Suspense } from "react";
import { ChangeEmailForm } from "@/components/auth/change-email-form";

export const metadata: Metadata = {
  title: "Change email",
  robots: { index: false, follow: false },
};

export default function AccountEmailPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
      <ChangeEmailForm />
    </Suspense>
  );
}
