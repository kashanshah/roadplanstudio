"use client";

import { usePathname } from "next/navigation";
import { AccountNav } from "@/components/auth/account-nav";

export function AccountNavBridge() {
  const pathname = usePathname() || "/account";
  return <AccountNav pathname={pathname} />;
}
