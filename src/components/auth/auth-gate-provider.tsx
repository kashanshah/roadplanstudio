"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthGateModal, type AuthGateIntent } from "@/components/auth/auth-gate-modal";

type AuthGateContextValue = {
  requireAuth: (intent: AuthGateIntent) => void;
  close: () => void;
};

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<AuthGateIntent>("save");

  const requireAuth = useCallback((nextIntent: AuthGateIntent) => {
    setIntent(nextIntent);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ requireAuth, close }),
    [requireAuth, close],
  );

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <AuthGateModal open={open} intent={intent} onClose={close} />
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) {
    throw new Error("useAuthGate must be used within AuthGateProvider");
  }
  return ctx;
}
