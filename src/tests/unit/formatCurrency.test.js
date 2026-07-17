import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/utils/formatCurrency";

describe("formatCurrency", () => {
  it("formatea un número entero como pesos colombianos sin decimales", () => {
    const result = formatCurrency(120000);

    expect(result).toContain("120.000");
    expect(result).toMatch(/\$/);
  });

  it("redondea valores con decimales al formatear", () => {
    const result = formatCurrency(1500.75);

    expect(result).not.toMatch(/,\d/);
  });

  it("formatea el valor cero correctamente", () => {
    expect(formatCurrency(0)).toContain("0");
  });
});
