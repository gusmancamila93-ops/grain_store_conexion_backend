import { describe, expect, it } from "vitest";
import { comparePassword, hashPassword } from "#utils/password.js";

describe("password utils", () => {
  it("genera un hash distinto a la contraseña original", async () => {
    const hash = await hashPassword("admin123");
    expect(hash).not.toBe("admin123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("permite autenticación cuando la contraseña es correcta", async () => {
    const hash = await hashPassword("clave-segura-1");
    const result = await comparePassword("clave-segura-1", hash);
    expect(result).toBe(true);
  });

  it("rechaza el acceso cuando la contraseña es incorrecta", async () => {
    const hash = await hashPassword("clave-segura-1");
    const result = await comparePassword("clave-incorrecta", hash);
    expect(result).toBe(false);
  });
});
