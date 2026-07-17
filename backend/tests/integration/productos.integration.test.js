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

describe("GET /api/productos", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
  });

  it("retorna 401 sin token de autenticación", async () => {
    const res = await request(app).get("/api/productos");
    expect(res.status).toBe(401);
  });

  it("retorna 403 cuando el rol no tiene permiso (contador)", async () => {
    const res = await request(app).get("/api/productos").set("Authorization", bearerFor({ rol: "contador" }));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("retorna 200 con la lista de productos y su estado calculado para el rol admin", async () => {
    prismaMock.current.producto.findMany.mockResolvedValue([
      { id: 1, codigo: "PRD-001", nombre: "Arroz", categoria: "Arroz", stock: 0, stockMinimo: 5, precio: 3200, createdAt: new Date() },
    ]);

    const res = await request(app).get("/api/productos").set("Authorization", bearerFor({ rol: "admin" }));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe("Agotado");
  });
});
