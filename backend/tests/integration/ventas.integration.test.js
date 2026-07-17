import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createPrismaMock } from "../helpers/prismaMock.js";
import { bearerFor } from "../helpers/authToken.js";

const prismaMock = vi.hoisted(() => ({ current: null }));

vi.mock("#config/db.js", () => ({
  get prisma() {
    return prismaMock.current;
  },
}));

const { app } = await import("../../src/app.js");

describe("GET /api/ventas", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
  });

  it("retorna 200 con la lista de ventas resumidas", async () => {
    prismaMock.current.venta.findMany.mockResolvedValue([
      {
        id: 1,
        codigo: "VEN-001",
        clienteId: 1,
        cliente: { nombre: "Cliente A" },
        usuario: { nombre: "Vendedor A" },
        fecha: new Date(2026, 0, 1),
        metodoPago: "Contado",
        estado: "Pagada",
        total: 15000,
      },
    ]);

    const res = await request(app).get("/api/ventas").set("Authorization", bearerFor({ rol: "vendedor" }));

    expect(res.status).toBe(200);
    expect(res.body[0].code).toBe("VEN-001");
  });
});

describe("POST /api/ventas (regla de negocio de stock)", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
  });

  it("retorna 400 INSUFFICIENT_STOCK cuando la cantidad solicitada supera el stock disponible", async () => {
    prismaMock.current.producto.findMany.mockResolvedValue([
      { id: 1, nombre: "Arroz", stock: 2 },
    ]);

    const res = await request(app)
      .post("/api/ventas")
      .set("Authorization", bearerFor({ rol: "vendedor" }))
      .send({
        customerId: 1,
        date: "2026-07-17",
        paymentMethod: "Contado",
        status: "Pagada",
        items: [{ productId: 1, quantity: 10, unitPrice: 3200 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INSUFFICIENT_STOCK");
  });

  it("retorna 400 PRODUCT_NOT_FOUND cuando el producto no existe", async () => {
    prismaMock.current.producto.findMany.mockResolvedValue([]);

    const res = await request(app)
      .post("/api/ventas")
      .set("Authorization", bearerFor({ rol: "vendedor" }))
      .send({
        customerId: 1,
        date: "2026-07-17",
        paymentMethod: "Contado",
        status: "Pagada",
        items: [{ productId: 99, quantity: 1, unitPrice: 3200 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("PRODUCT_NOT_FOUND");
  });
});
