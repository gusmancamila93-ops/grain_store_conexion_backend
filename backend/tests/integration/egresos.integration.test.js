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

describe("GET /api/egresos", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
  });

  it("retorna 403 cuando el rol no tiene permiso (vendedor)", async () => {
    const res = await request(app).get("/api/egresos").set("Authorization", bearerFor({ rol: "vendedor" }));

    expect(res.status).toBe(403);
  });

  it("retorna 200 con la lista de egresos para el rol contador", async () => {
    prismaMock.current.egreso.findMany.mockResolvedValue([
      {
        id: 1,
        codigo: "EGR-001",
        fecha: new Date(2026, 0, 1),
        categoria: "Transporte",
        descripcion: "Flete",
        valor: 50000,
        usuario: { nombre: "Cris Contador" },
      },
    ]);

    const res = await request(app).get("/api/egresos").set("Authorization", bearerFor({ rol: "contador" }));

    expect(res.status).toBe(200);
    expect(res.body[0].value).toBe(50000);
  });

  it("crea un egreso asociándolo al usuario autenticado", async () => {
    prismaMock.current.egreso.count.mockResolvedValue(3);
    prismaMock.current.egreso.create.mockResolvedValue({
      id: 4,
      codigo: "EGR-004",
      fecha: new Date(2026, 0, 5),
      categoria: "Nómina",
      descripcion: "Pago quincena",
      valor: 200000,
      usuario: { nombre: "Cris Contador" },
    });

    const res = await request(app)
      .post("/api/egresos")
      .set("Authorization", bearerFor({ id: 3, rol: "contador" }))
      .send({ date: "2026-01-05", category: "Nómina", description: "Pago quincena", value: 200000 });

    expect(res.status).toBe(201);
    expect(prismaMock.current.egreso.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ usuarioId: 3 }) }),
    );
  });
});
