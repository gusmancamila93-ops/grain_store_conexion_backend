import { vi } from "vitest";

const MODELS = ["usuario", "cliente", "producto", "venta", "detalleVenta", "egreso", "configuracionTienda"];

export function createPrismaMock() {
  const mock = { $transaction: vi.fn() };

  for (const model of MODELS) {
    mock[model] = {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
  }

  mock.$transaction.mockImplementation(async (callback) => callback(mock));

  return mock;
}
