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

describe("GET /api/clientes", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
  });

  it("retorna 401 sin token de autenticación", async () => {
    const res = await request(app).get("/api/clientes");
    expect(res.status).toBe(401);
  });

  it("retorna 200 con la lista de clientes para cualquiera de los tres roles autorizados", async () => {
    prismaMock.current.cliente.findMany.mockResolvedValue([
      { id: 1, documento: "123", nombre: "Cliente A", telefono: "300", correo: "a@a.com", direccion: "Cra 1", tipo: "Minorista", estado: "Activo" },
    ]);

    const res = await request(app).get("/api/clientes").set("Authorization", bearerFor({ rol: "contador" }));

    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Cliente A");
  });

  it("retorna 404 al actualizar un cliente inexistente", async () => {
    prismaMock.current.cliente.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put("/api/clientes/999")
      .set("Authorization", bearerFor({ rol: "admin" }))
      .send({ name: "Nuevo nombre" });

    expect(res.status).toBe(404);
  });
});
