"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthGateProvider } from "@/components/auth/auth-gate-provider";
import { DisplayPrefsProvider } from "@/lib/prefs/display-prefs";
import { GuestTripProvider } from "@/lib/trips/guest-trip-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <GuestTripProvider>
        <DisplayPrefsProvider>
          <AuthGateProvider>{children}</AuthGateProvider>
        </DisplayPrefsProvider>
      </GuestTripProvider>
    </QueryClientProvider>
  );
}
