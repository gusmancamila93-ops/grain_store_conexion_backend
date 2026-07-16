import { useMemo, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.readSession());

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session),
      async login(credentials) {
        const nextSession = await authService.login(credentials);
        setSession(nextSession);
        return nextSession;
      },
      logout() {
        authService.logout();
        setSession(null);
      },
      updateProfile(patch) {
        setSession((current) => {
          const next = { ...current, ...patch };
          authService.saveSession(next);
          return next;
        });
      },
      session,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
