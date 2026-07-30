"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "@/lib/auth-client";

export type TimeFormat = "h12" | "h24";

const STORAGE_KEY = "roadplan.timeFormat";

type DisplayPrefsContextValue = {
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
  hydrated: boolean;
};

const DisplayPrefsContext = createContext<DisplayPrefsContextValue | null>(
  null,
);

function readLocal(): TimeFormat {
  if (typeof window === "undefined") return "h12";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "h24" ? "h24" : "h12";
}

function writeLocal(format: TimeFormat) {
  window.localStorage.setItem(STORAGE_KEY, format);
}

export function DisplayPrefsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>("h12");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTimeFormatState(readLocal());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;
    fetch("/api/account/profile")
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json() as Promise<{
          profile?: { timeFormat?: TimeFormat };
        }>;
      })
      .then((data) => {
        if (cancelled || !data?.profile?.timeFormat) return;
        const format = data.profile.timeFormat === "h24" ? "h24" : "h12";
        setTimeFormatState(format);
        writeLocal(format);
      })
      .catch(() => {
        /* keep local */
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const setTimeFormat = useCallback(
    (format: TimeFormat) => {
      setTimeFormatState(format);
      writeLocal(format);
      if (!session?.user) return;
      void fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeFormat: format }),
      });
    },
    [session?.user],
  );

  return (
    <DisplayPrefsContext.Provider
      value={{ timeFormat, setTimeFormat, hydrated }}
    >
      {children}
    </DisplayPrefsContext.Provider>
  );
}

export function useDisplayPrefs() {
  const ctx = useContext(DisplayPrefsContext);
  if (!ctx) {
    throw new Error("useDisplayPrefs must be used within DisplayPrefsProvider");
  }
  return ctx;
}

/** Format minutes-from-midnight (can exceed 24h) for timeline clocks. */
export function formatClock(
  totalMins: number,
  timeFormat: TimeFormat = "h12",
): string {
  const normalized = ((totalMins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const mm = String(m).padStart(2, "0");

  if (timeFormat === "h24") {
    return `${String(h24).padStart(2, "0")}:${mm}`;
  }

  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm} ${period}`;
}
