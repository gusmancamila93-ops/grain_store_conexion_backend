import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "@/components/common/Modal";

describe("Modal", () => {
  it("no renderiza nada cuando open es false", () => {
    const { container } = render(<Modal open={false} title="Detalle" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza el título y el contenido cuando open es true", () => {
    render(
      <Modal open title="Detalle de venta">
        <p>Contenido de la venta</p>
      </Modal>,
    );

    expect(screen.getByText("Detalle de venta")).toBeInTheDocument();
    expect(screen.getByText("Contenido de la venta")).toBeInTheDocument();
  });

  it("invoca onClose al hacer clic en el botón de cerrar", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<Modal open title="Detalle" onClose={handleClose} />);
    await user.click(screen.getByLabelText("Cerrar modal"));

    expect(handleClose).toHaveBeenCalledOnce();
  });
});
