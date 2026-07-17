import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createPrismaMock } from "../helpers/prismaMock.js";

vi.mock("#config/db.js", () => ({ prisma: createPrismaMock() }));

const { app } = await import("../../src/app.js");

describe("GET /api/health y rutas desconocidas", () => {
  it("responde 200 con estado 'ok' sin requerir autenticación", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("responde 404 con código NOT_FOUND para una ruta inexistente", async () => {
    const res = await request(app).get("/api/no-existe");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
