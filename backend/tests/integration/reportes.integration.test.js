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

describe("GET /api/reportes", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
    prismaMock.current.venta.findMany.mockResolvedValue([]);
    prismaMock.current.egreso.findMany.mockResolvedValue([]);
  });

  it("retorna 403 para el rol vendedor (sin permiso)", async () => {
    const res = await request(app).get("/api/reportes").set("Authorization", bearerFor({ rol: "vendedor" }));

    expect(res.status).toBe(403);
  });

  it("retorna 200 con la estructura de reportes para el rol admin", async () => {
    const res = await request(app).get("/api/reportes").set("Authorization", bearerFor({ rol: "admin" }));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("stats");
    expect(res.body).toHaveProperty("monthly");
    expect(res.body.monthly).toHaveLength(12);
  });
});
