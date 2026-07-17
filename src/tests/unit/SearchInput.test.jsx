import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchInput from "@/components/common/SearchInput";

describe("SearchInput", () => {
  it("muestra el placeholder por defecto cuando no se especifica uno", () => {
    render(<SearchInput value="" onChange={() => {}} />);

    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
  });

  it("invoca onChange con el valor tecleado por el usuario", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SearchInput value="" onChange={handleChange} placeholder="Buscar cliente" />);

    await user.type(screen.getByPlaceholderText("Buscar cliente"), "a");

    expect(handleChange).toHaveBeenCalled();
  });
});
