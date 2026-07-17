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

describe("GET /api/dashboard (según rol)", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
    prismaMock.current.venta.findMany.mockResolvedValue([]);
    prismaMock.current.producto.findMany.mockResolvedValue([]);
    prismaMock.current.cliente.findMany.mockResolvedValue([]);
    prismaMock.current.egreso.findMany.mockResolvedValue([]);
  });

  it("retorna el panel de administrador cuando el rol es admin", async () => {
    const res = await request(app).get("/api/dashboard").set("Authorization", bearerFor({ rol: "admin" }));

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Bienvenido, Administrador");
  });

  it("retorna el panel de vendedor con sus propias ventas cuando el rol es vendedor", async () => {
    const res = await request(app).get("/api/dashboard").set("Authorization", bearerFor({ id: 9, rol: "vendedor" }));

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Bienvenido, Vendedor");
    expect(prismaMock.current.venta.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ usuarioId: 9 }) }),
    );
  });

  it("retorna 401 sin autenticación", async () => {
    const res = await request(app).get("/api/dashboard");
    expect(res.status).toBe(401);
  });
});
