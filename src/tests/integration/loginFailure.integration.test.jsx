import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderAppAt } from "./testAppHelper.jsx";

describe("Flujo de inicio de sesión fallido", () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra el error del servidor y no navega ni persiste sesión cuando las credenciales son inválidas", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({ error: { message: "Credenciales inválidas para el rol seleccionado.", code: "UNAUTHORIZED" } }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await renderAppAt("/login");

    await user.click(screen.getByRole("button", { name: /entrar al panel/i }));

    expect(await screen.findByText("Credenciales inválidas para el rol seleccionado.")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");
    expect(window.localStorage.getItem("session_gs")).toBeNull();
  });
});
