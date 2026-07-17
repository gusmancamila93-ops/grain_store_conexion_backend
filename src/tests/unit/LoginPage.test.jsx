import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "@/pages/auth/LoginPage";
import { AuthContext } from "@/contexts/AuthContext";
import { MOCK_USERS } from "@/services/authService";

function renderLoginPage(authOverrides = {}) {
  const contextValue = {
    isAuthenticated: false,
    session: null,
    login: vi.fn(),
    ...authOverrides,
  };

  render(
    <MemoryRouter>
      <AuthContext.Provider value={contextValue}>
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  return contextValue;
}

describe("LoginPage", () => {
  it("precarga el formulario con los datos del primer usuario simulado", () => {
    renderLoginPage();

    expect(screen.getByPlaceholderText("correo@grainstore.com")).toHaveValue(MOCK_USERS[0].email);
    expect(screen.getByPlaceholderText("Contraseña")).toHaveValue(MOCK_USERS[0].password);
  });

  it("actualiza el campo de correo cuando el usuario escribe", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText("correo@grainstore.com");
    await user.clear(emailInput);
    await user.type(emailInput, "nuevo@grainstore.com");

    expect(emailInput).toHaveValue("nuevo@grainstore.com");
  });

  it("rellena el formulario al hacer clic en un usuario de demostración distinto", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const vendedor = MOCK_USERS.find((u) => u.role === "vendedor");
    await user.click(screen.getByText(vendedor.email));

    expect(screen.getByPlaceholderText("correo@grainstore.com")).toHaveValue(vendedor.email);
    expect(screen.getByPlaceholderText("Contraseña")).toHaveValue(vendedor.password);
  });

  it("muestra un mensaje de error cuando el login falla", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new Error("Credenciales inválidas para el rol seleccionado."));
    renderLoginPage({ login });

    await user.click(screen.getByRole("button", { name: /entrar al panel/i }));

    expect(await screen.findByText("Credenciales inválidas para el rol seleccionado.")).toBeInTheDocument();
  });
});
