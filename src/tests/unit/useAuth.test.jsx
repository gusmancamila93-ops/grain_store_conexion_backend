import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";
import { AuthContext } from "@/contexts/AuthContext";

describe("useAuth", () => {
  it("lanza un error cuando se usa fuera de AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow("useAuth debe usarse dentro de AuthProvider.");
  });

  it("retorna el valor del contexto cuando se usa dentro de AuthProvider", () => {
    const contextValue = { isAuthenticated: true, session: { role: "admin" } };
    const wrapper = ({ children }) => <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBe(contextValue);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
