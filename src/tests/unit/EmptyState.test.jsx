import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "@/components/common/EmptyState";

describe("EmptyState", () => {
  it("usa el título y mensaje por defecto cuando no se pasan props", () => {
    render(<EmptyState />);

    expect(screen.getByText("Sin registros")).toBeInTheDocument();
    expect(screen.getByText("Aún no hay información disponible.")).toBeInTheDocument();
  });

  it("renderiza el título y mensaje personalizados", () => {
    render(<EmptyState title="Sin ventas" message="Registra tu primera venta." />);

    expect(screen.getByText("Sin ventas")).toBeInTheDocument();
    expect(screen.getByText("Registra tu primera venta.")).toBeInTheDocument();
  });
});
