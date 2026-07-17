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
const { hashPassword } = await import("#utils/password.js");

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
  });

  it("retorna 200 y un token cuando las credenciales son válidas", async () => {
    const passwordHash = await hashPassword("secreta123");
    prismaMock.current.usuario.findUnique.mockResolvedValue({
      id: 1,
      nombre: "Ada Admin",
      correo: "admin@grainstore.com",
      passwordHash,
      rol: "admin",
      estado: "Activo",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@grainstore.com", password: "secreta123", role: "admin" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.user.role).toBe("admin");
  });

  it("retorna 401 cuando las credenciales son inválidas", async () => {
    prismaMock.current.usuario.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nadie@grainstore.com", password: "secreta123", role: "admin" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("retorna 400 con detalles de validación cuando faltan campos obligatorios", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "admin@grainstore.com" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });
});

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
  });

  it("retorna 401 sin token de autenticación", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });

  it("retorna 200 con el perfil del usuario autenticado", async () => {
    prismaMock.current.usuario.findUnique.mockResolvedValue({
      id: 1,
      nombre: "Ada Admin",
      correo: "admin@grainstore.com",
      rol: "admin",
      estado: "Activo",
      telefono: null,
      foto: null,
    });

    const res = await request(app).get("/api/auth/me").set("Authorization", bearerFor({ id: 1, rol: "admin" }));

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("admin@grainstore.com");
  });
});
