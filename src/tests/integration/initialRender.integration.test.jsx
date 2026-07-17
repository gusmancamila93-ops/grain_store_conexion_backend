import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderAppAt } from "./testAppHelper.jsx";

describe("Renderizado inicial del sistema", () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  it("redirige la ruta raíz a /login cuando no hay sesión activa", async () => {
    await renderAppAt("/");

    expect(await screen.findByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");
  });

  it("redirige una ruta desconocida a /login sin sesión activa", async () => {
    await renderAppAt("/una-ruta-que-no-existe");

    expect(await screen.findByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});
