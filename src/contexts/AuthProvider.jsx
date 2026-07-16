import { useMemo, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.readSession());

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session),
      login(credentials) {
        const nextSession = authService.login(credentials);
        setSession(nextSession);
        return nextSession;
      },
      logout() {
        authService.logout();
        setSession(null);
      },
      session,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
