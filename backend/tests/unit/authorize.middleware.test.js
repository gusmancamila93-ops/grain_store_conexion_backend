import { describe, expect, it, vi } from "vitest";
import { authorize } from "#middlewares/authorize.js";

function mockRes() {
  return {};
}

describe("authorize middleware (permisos por rol)", () => {
  it("llama a next() cuando el rol del usuario está permitido", () => {
    const next = vi.fn();
    const req = { user: { rol: "admin" } };

    authorize("admin", "contador")(req, mockRes(), next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("lanza 403 cuando el rol del usuario no está en la lista permitida", () => {
    const next = vi.fn();
    const req = { user: { rol: "vendedor" } };

    expect(() => authorize("admin", "contador")(req, mockRes(), next)).toThrow(
      expect.objectContaining({ statusCode: 403 }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("lanza 401 cuando no hay usuario autenticado en la petición", () => {
    const next = vi.fn();
    const req = {};

    expect(() => authorize("admin")(req, mockRes(), next)).toThrow(
      expect.objectContaining({ statusCode: 401 }),
    );
  });

  it("permite cualquier rol autenticado cuando no se especifican roles", () => {
    const next = vi.fn();
    const req = { user: { rol: "vendedor" } };

    authorize()(req, mockRes(), next);

    expect(next).toHaveBeenCalledOnce();
  });
});
