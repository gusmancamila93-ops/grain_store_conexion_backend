import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renderiza el texto hijo y el variant por defecto", () => {
    render(<Button>Guardar</Button>);

    const button = screen.getByRole("button", { name: "Guardar" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-variant", "default");
  });

  it("aplica el variant y size indicados", () => {
    render(
      <Button variant="destructive" size="sm">
        Eliminar
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Eliminar" });
    expect(button).toHaveAttribute("data-variant", "destructive");
    expect(button).toHaveAttribute("data-size", "sm");
  });

  it("ejecuta onClick al hacer clic", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Confirmar</Button>);
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("no ejecuta onClick cuando el botón está deshabilitado", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Confirmar
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
