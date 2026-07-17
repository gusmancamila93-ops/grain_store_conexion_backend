import { describe, expect, it } from "vitest";
import { getProductStatus } from "#utils/constants.js";

describe("getProductStatus", () => {
  it("retorna 'Agotado' cuando el stock es cero", () => {
    expect(getProductStatus({ stock: 0, stockMinimo: 5 })).toBe("Agotado");
  });

  it("retorna 'Agotado' cuando el stock es negativo", () => {
    expect(getProductStatus({ stock: -3, stockMinimo: 5 })).toBe("Agotado");
  });

  it("retorna 'Bajo stock' cuando el stock está por debajo o igual al mínimo", () => {
    expect(getProductStatus({ stock: 5, stockMinimo: 5 })).toBe("Bajo stock");
    expect(getProductStatus({ stock: 3, stockMinimo: 5 })).toBe("Bajo stock");
  });

  it("retorna 'Normal' cuando el stock supera el mínimo", () => {
    expect(getProductStatus({ stock: 20, stockMinimo: 5 })).toBe("Normal");
  });
});
