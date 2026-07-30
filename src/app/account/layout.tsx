import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountNavBridge } from "@/components/auth/account-nav-bridge";
import { SiteNav } from "@/components/layout/site-nav";
import { getSession } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login?next=/account");
  }

  return (
    <div className="min-h-full bg-background text-[17px]">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="eyebrow text-primary">Account</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-base text-muted-foreground sm:text-lg">
          Signed in as{" "}
          <span className="break-all">{session.user.email}</span>
        </p>
        <div className="mt-6">
          <AccountNavBridge />
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
