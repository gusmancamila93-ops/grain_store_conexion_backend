import { describe, expect, it } from "vitest";
import { ApiError } from "#utils/ApiError.js";

describe("ApiError factories", () => {
  it("unauthorized genera código 401 y código UNAUTHORIZED", () => {
    const error = ApiError.unauthorized();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
  });

  it("forbidden genera código 403 y código FORBIDDEN", () => {
    const error = ApiError.forbidden();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
  });

  it("notFound genera código 404 con mensaje personalizado", () => {
    const error = ApiError.notFound("Producto no encontrado.");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Producto no encontrado.");
  });

  it("badRequest usa código BAD_REQUEST por defecto y permite sobreescribirlo", () => {
    const defaultError = ApiError.badRequest("Datos inválidos.");
    expect(defaultError.code).toBe("BAD_REQUEST");

    const customError = ApiError.badRequest("Stock insuficiente.", "INSUFFICIENT_STOCK");
    expect(customError.code).toBe("INSUFFICIENT_STOCK");
    expect(customError.statusCode).toBe(400);
  });
});
