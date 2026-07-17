import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "#utils/jwt.js";

describe("jwt utils", () => {
  it("genera un token que puede verificarse y conserva el payload original", () => {
    const token = signToken({ id: 7, rol: "admin", nombre: "Ada" });
    const payload = verifyToken(token);

    expect(payload.sub).toBe(7);
    expect(payload.rol).toBe("admin");
    expect(payload.nombre).toBe("Ada");
  });

  it("rechaza un token con firma inválida", () => {
    const token = signToken({ id: 1, rol: "vendedor", nombre: "Bea" });
    const tampered = `${token}tampered`;

    expect(() => verifyToken(tampered)).toThrow();
  });

  it("rechaza una cadena que no es un token válido", () => {
    expect(() => verifyToken("no-es-un-token")).toThrow();
  });
});
