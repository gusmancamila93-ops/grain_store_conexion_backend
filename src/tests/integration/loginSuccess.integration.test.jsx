import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderAppAt } from "./testAppHelper.jsx";

function jsonResponse(body, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe("Flujo de inicio de sesión exitoso", () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("autentica al administrador, guarda la sesión y navega a su panel con datos reales de la API", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn((url) => {
      const href = String(url);
      if (href.includes("/auth/login")) {
        return jsonResponse({
          token: "token-de-prueba",
          user: { id: 1, name: "Administrador", email: "admin@grainstore.com", role: "admin" },
        });
      }
      if (href.includes("/dashboard")) {
        return jsonResponse({
          title: "Bienvenido, Administrador",
          subtitle: "Resumen",
          stats: [],
          chartTitle: "Actividad",
          chartSeries: [{ label: "Ene", value: 0 }],
          indicators: [],
          tableTitle: "Movimientos",
          movements: [],
        });
      }
      return jsonResponse({}, 404);
    });
    vi.stubGlobal("fetch", fetchMock);

    await renderAppAt("/login");

    await user.click(screen.getByRole("button", { name: /entrar al panel/i }));

    expect(await screen.findByText("Bienvenido, Administrador")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/admin/dashboard");

    await waitFor(() => {
      expect(window.localStorage.getItem("session_gs")).toContain("token-de-prueba");
    });

    const dashboardCall = fetchMock.mock.calls.find(([url]) => String(url).includes("/dashboard"));
    expect(dashboardCall[1].headers.Authorization).toBe("Bearer token-de-prueba");
  });
});
