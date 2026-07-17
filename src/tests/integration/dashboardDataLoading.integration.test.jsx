import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderAppAt } from "./testAppHelper.jsx";

describe("Carga de datos del dashboard desde la API simulada", () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("navega según el rol del usuario y muestra el panel correspondiente al vendedor", async () => {
    window.localStorage.setItem(
      "session_gs",
      JSON.stringify({ id: 9, name: "Vera Vendedor", email: "vendedor@grainstore.com", role: "vendedor", token: "tok-vendedor" }),
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              title: "Bienvenido, Vendedor",
              subtitle: "Mis ventas",
              stats: [],
              chartTitle: "Mi actividad",
              chartSeries: [{ label: "Ene", value: 0 }],
              indicators: [],
              tableTitle: "Mis Ventas Recientes",
              movements: [],
            }),
        }),
      ),
    );

    await renderAppAt("/vendedor/dashboard");

    expect(await screen.findByText("Bienvenido, Vendedor")).toBeInTheDocument();
  });

  it("muestra un estado de error con opción de reintento cuando la API falla", async () => {
    const user = userEvent.setup();

    window.localStorage.setItem(
      "session_gs",
      JSON.stringify({ id: 1, name: "Ada Admin", email: "admin@grainstore.com", role: "admin", token: "tok-admin" }),
    );

    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: { message: "Error interno del servidor." } }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await renderAppAt("/admin/dashboard");

    expect(await screen.findByText(/no se pudo cargar el panel/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reintentar/i }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
