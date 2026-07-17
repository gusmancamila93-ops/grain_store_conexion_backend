import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "@/components/common/StatCard";

describe("StatCard", () => {
  it("renderiza la etiqueta y el valor recibidos", () => {
    render(<StatCard label="Ventas del Día" value="$120.000" />);

    expect(screen.getByText("Ventas del Día")).toBeInTheDocument();
    expect(screen.getByText("$120.000")).toBeInTheDocument();
  });

  it("no renderiza el badge cuando no se proporciona", () => {
    render(<StatCard label="Clientes" value="10" />);

    expect(screen.queryByText(/./, { selector: ".gs-card-badge" })).not.toBeInTheDocument();
  });

  it("renderiza el badge y el detalle cuando se proporcionan", () => {
    render(<StatCard label="Clientes Activos" value="42" badge="Total" detail="Actualizado hoy" />);

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Actualizado hoy")).toBeInTheDocument();
  });
});
