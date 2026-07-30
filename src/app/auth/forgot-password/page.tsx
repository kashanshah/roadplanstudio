import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password."
      subtitle="Enter your email and we'll send a secure reset link."
      footer={
        <Link
          href="/auth/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-4">
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="h-10 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <Button type="submit" size="lg" className="w-full">
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
