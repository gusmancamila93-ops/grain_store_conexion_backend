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

describe("GET /api/usuarios", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
  });

  it("retorna 403 cuando el rol autenticado no es admin", async () => {
    const res = await request(app).get("/api/usuarios").set("Authorization", bearerFor({ rol: "contador" }));

    expect(res.status).toBe(403);
  });

  it("retorna 200 con la lista de usuarios (sin exponer el hash de contraseña) para admin", async () => {
    prismaMock.current.usuario.findMany.mockResolvedValue([
      { id: 1, nombre: "Ada Admin", correo: "admin@grainstore.com", passwordHash: "hash-secreto", rol: "admin", estado: "Activo", telefono: null },
    ]);

    const res = await request(app).get("/api/usuarios").set("Authorization", bearerFor({ rol: "admin" }));

    expect(res.status).toBe(200);
    expect(res.body[0]).not.toHaveProperty("passwordHash");
    expect(res.body[0].email).toBe("admin@grainstore.com");
  });

  it("retorna 400 de validación cuando la contraseña es demasiado corta al crear un usuario", async () => {
    const res = await request(app)
      .post("/api/usuarios")
      .set("Authorization", bearerFor({ rol: "admin" }))
      .send({ name: "Nuevo", email: "nuevo@grainstore.com", password: "123", role: "vendedor" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
