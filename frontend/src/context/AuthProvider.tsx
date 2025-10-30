import { createContext, useContext, useEffect, useState } from "react";
import { logout as apiLogout } from "../api/client";

type AuthState = { isAuthed: boolean; loading: boolean };
type Ctx = AuthState & { loginSignal: number; setAuthed: (v: boolean) => void; doLogout: () => Promise<void> };

const AuthCtx = createContext<Ctx | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginSignal, setLoginSignal] = useState(0);

  useEffect(() => {
    // heuristic: ping a protected route to infer auth
    fetch("/api/cart", { credentials: "include" })
      .then((r) => setIsAuthed(r.status !== 401))
      .finally(() => setLoading(false));
  }, [loginSignal]);

  const setAuthed = (v: boolean) => {
    setIsAuthed(v);
    if (v) setLoginSignal((s) => s + 1);
  };

  const doLogout = async () => {
    await apiLogout();
    setAuthed(false);
  };

  return <AuthCtx.Provider value={{ isAuthed, loading, loginSignal, setAuthed, doLogout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
