import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RoleGuard from "@/routes/RoleGuard";
import { AuthContext } from "@/contexts/AuthContext";

function renderGuarded(authValue, initialPath = "/admin/dashboard") {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<div>Pantalla de login</div>} path="/login" />
          <Route element={<div>Panel de vendedor</div>} path="/vendedor/dashboard" />
          <Route element={<RoleGuard allowedRoles={["admin"]}>{<div>Panel de administrador</div>}</RoleGuard>} path="/admin/dashboard" />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("RoleGuard (protección de rutas por rol)", () => {
  it("redirige a /login cuando el usuario no está autenticado", () => {
    renderGuarded({ isAuthenticated: false, session: null });

    expect(screen.getByText("Pantalla de login")).toBeInTheDocument();
  });

  it("redirige al home del rol cuando el usuario autenticado no tiene el rol permitido", () => {
    renderGuarded({ isAuthenticated: true, session: { role: "vendedor" } });

    expect(screen.getByText("Panel de vendedor")).toBeInTheDocument();
  });

  it("renderiza el contenido protegido cuando el rol coincide con los permitidos", () => {
    renderGuarded({ isAuthenticated: true, session: { role: "admin" } });

    expect(screen.getByText("Panel de administrador")).toBeInTheDocument();
  });
});
