import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderAppAt } from "./testAppHelper.jsx";

const DASHBOARD_PAYLOAD = {
  title: "Bienvenido, Administrador",
  subtitle: "Resumen",
  stats: [],
  chartTitle: "Actividad",
  chartSeries: [{ label: "Ene", value: 0 }],
  indicators: [],
  tableTitle: "Movimientos",
  movements: [],
};

describe("Flujo de cierre de sesión", () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("limpia la sesión guardada y redirige a /login al cerrar sesión desde el panel", async () => {
    const user = userEvent.setup();

    window.localStorage.setItem(
      "session_gs",
      JSON.stringify({ id: 1, name: "Ada Admin", email: "admin@grainstore.com", role: "admin", token: "token-abc" }),
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(DASHBOARD_PAYLOAD) })),
    );

    await renderAppAt("/admin/dashboard");

    expect(await screen.findByText("Bienvenido, Administrador")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /salir/i }));

    expect(await screen.findByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(window.localStorage.getItem("session_gs")).toBeNull();
  });
});
