import { describe, expect, it, vi } from "vitest";
import { validate } from "#middlewares/validate.js";
import { loginSchema } from "#modules/auth/auth.schema.js";

function mockRes() {
  return {};
}

describe("validate middleware (validaciones obligatorias)", () => {
  it("deja pasar la petición y normaliza los datos cuando son válidos", () => {
    const next = vi.fn();
    const req = { body: { email: "ADMIN@GrainStore.com", password: "123456", role: "admin" }, query: {}, params: {} };

    validate(loginSchema)(req, mockRes(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.body.email).toBe("admin@grainstore.com");
  });

  it("lanza un error 400 VALIDATION_ERROR cuando faltan campos obligatorios", () => {
    const next = vi.fn();
    const req = { body: { email: "admin@grainstore.com" }, query: {}, params: {} };

    expect(() => validate(loginSchema)(req, mockRes(), next)).toThrow(
      expect.objectContaining({ statusCode: 400, code: "VALIDATION_ERROR" }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("rechaza un correo con formato inválido", () => {
    const next = vi.fn();
    const req = { body: { email: "no-es-un-correo", password: "123456", role: "admin" }, query: {}, params: {} };

    expect(() => validate(loginSchema)(req, mockRes(), next)).toThrow();
  });

  it("rechaza un rol que no está dentro de los roles permitidos", () => {
    const next = vi.fn();
    const req = { body: { email: "a@a.com", password: "123456", role: "gerente" }, query: {}, params: {} };

    expect(() => validate(loginSchema)(req, mockRes(), next)).toThrow();
  });
});
