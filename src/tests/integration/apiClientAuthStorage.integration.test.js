import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function jsonResponse(body, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe("Integración authService + apiClient + storage", () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("persiste la sesión al iniciar sesión y adjunta el token en peticiones posteriores", async () => {
    const fetchMock = vi.fn((url) => {
      const href = String(url);
      if (href.includes("/auth/login")) {
        return jsonResponse({ token: "abc123", user: { id: 1, name: "Ada", email: "admin@grainstore.com", role: "admin" } });
      }
      return jsonResponse([{ id: 1, name: "Cliente A" }]);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { authService } = await import("@/services/authService");
    const { apiClient } = await import("@/services/apiClient");

    const session = await authService.login({ email: "admin@grainstore.com", password: "secreta123", role: "admin" });
    expect(session.token).toBe("abc123");
    expect(window.localStorage.getItem("session_gs")).toContain("abc123");

    await apiClient.get("/clientes");

    const [, options] = fetchMock.mock.calls[1];
    expect(options.headers.Authorization).toBe("Bearer abc123");
  });

  it("limpia la sesión persistida cuando el servidor responde 401 en una petición protegida", async () => {
    window.history.pushState({}, "", "/login");
    window.localStorage.setItem(
      "session_gs",
      JSON.stringify({ id: 1, name: "Ada", email: "admin@grainstore.com", role: "admin", token: "token-expirado" }),
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: { message: "Sesión inválida o expirada." } }),
        }),
      ),
    );

    const { apiClient } = await import("@/services/apiClient");

    await expect(apiClient.get("/clientes")).rejects.toThrow("Sesión inválida o expirada.");
    expect(window.localStorage.getItem("session_gs")).toBeNull();
  });
});
