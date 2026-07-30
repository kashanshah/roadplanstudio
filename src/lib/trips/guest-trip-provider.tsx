"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clearGuestTrip,
  createEmptyGuestTrip,
  readGuestTrip,
  writeGuestTrip,
  type GuestTripDraft,
} from "@/lib/trips/guest-trip";

type GuestTripContextValue = {
  draft: GuestTripDraft | null;
  hydrated: boolean;
  startPlanning: (input?: {
    title?: string;
    startLocation?: string;
    endLocation?: string;
  }) => GuestTripDraft;
  loadDraft: (draft: GuestTripDraft) => void;
  updateDraft: (updater: (current: GuestTripDraft) => GuestTripDraft) => void;
  clearDraft: () => void;
};

const GuestTripContext = createContext<GuestTripContextValue | null>(null);

export function GuestTripProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<GuestTripDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDraft(readGuestTrip());
    setHydrated(true);
  }, []);

  const startPlanning = useCallback(
    (input?: {
      title?: string;
      startLocation?: string;
      endLocation?: string;
    }) => {
      const next = createEmptyGuestTrip(input);
      writeGuestTrip(next);
      setDraft(next);
      return next;
    },
    [],
  );

  const loadDraft = useCallback((next: GuestTripDraft) => {
    writeGuestTrip(next);
    setDraft(next);
  }, []);

  const updateDraft = useCallback(
    (updater: (current: GuestTripDraft) => GuestTripDraft) => {
      setDraft((current) => {
        const base = current ?? createEmptyGuestTrip();
        const next = updater(base);
        writeGuestTrip(next);
        return next;
      });
    },
    [],
  );

  const clearDraft = useCallback(() => {
    clearGuestTrip();
    setDraft(null);
  }, []);

  return (
    <GuestTripContext.Provider
      value={{
        draft,
        hydrated,
        startPlanning,
        loadDraft,
        updateDraft,
        clearDraft,
      }}
    >
      {children}
    </GuestTripContext.Provider>
  );
}

export function useGuestTrip() {
  const ctx = useContext(GuestTripContext);
  if (!ctx) {
    throw new Error("useGuestTrip must be used within GuestTripProvider");
  }
  return ctx;
}
