import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPrismaMock } from "../helpers/prismaMock.js";

const prismaMock = vi.hoisted(() => ({ current: null }));

vi.mock("#config/db.js", () => ({
  get prisma() {
    return prismaMock.current;
  },
}));

const { authService } = await import("#modules/auth/auth.service.js");
const { hashPassword } = await import("#utils/password.js");

describe("authService.login (autenticación)", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
  });

  it("permite autenticación cuando el correo, rol y contraseña son correctos", async () => {
    const passwordHash = await hashPassword("secreta123");
    prismaMock.current.usuario.findUnique.mockResolvedValue({
      id: 1,
      nombre: "Ada Admin",
      correo: "admin@grainstore.com",
      passwordHash,
      rol: "admin",
      estado: "Activo",
      telefono: null,
      foto: null,
    });

    const result = await authService.login({ email: "admin@grainstore.com", password: "secreta123", role: "admin" });

    expect(result.token).toBeTypeOf("string");
    expect(result.user.role).toBe("admin");
    expect(result.user.email).toBe("admin@grainstore.com");
  });

  it("rechaza el acceso cuando la contraseña es incorrecta", async () => {
    const passwordHash = await hashPassword("secreta123");
    prismaMock.current.usuario.findUnique.mockResolvedValue({
      id: 1,
      nombre: "Ada Admin",
      correo: "admin@grainstore.com",
      passwordHash,
      rol: "admin",
      estado: "Activo",
    });

    await expect(
      authService.login({ email: "admin@grainstore.com", password: "otra-clave", role: "admin" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("rechaza el acceso cuando el rol seleccionado no coincide con el del usuario", async () => {
    const passwordHash = await hashPassword("secreta123");
    prismaMock.current.usuario.findUnique.mockResolvedValue({
      id: 2,
      nombre: "Vera Vendedor",
      correo: "vendedor@grainstore.com",
      passwordHash,
      rol: "vendedor",
      estado: "Activo",
    });

    await expect(
      authService.login({ email: "vendedor@grainstore.com", password: "secreta123", role: "admin" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("rechaza el acceso cuando el usuario está inactivo", async () => {
    const passwordHash = await hashPassword("secreta123");
    prismaMock.current.usuario.findUnique.mockResolvedValue({
      id: 3,
      nombre: "Cris Contador",
      correo: "contador@grainstore.com",
      passwordHash,
      rol: "contador",
      estado: "Inactivo",
    });

    await expect(
      authService.login({ email: "contador@grainstore.com", password: "secreta123", role: "contador" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rechaza el acceso cuando el correo no existe", async () => {
    prismaMock.current.usuario.findUnique.mockResolvedValue(null);

    await expect(
      authService.login({ email: "nadie@grainstore.com", password: "secreta123", role: "admin" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
