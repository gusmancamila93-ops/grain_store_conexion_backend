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

describe("GET /api/configuracion", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
  });

  it("retorna 403 cuando el rol no tiene acceso (vendedor)", async () => {
    const res = await request(app).get("/api/configuracion/sistema").set("Authorization", bearerFor({ rol: "vendedor" }));

    expect(res.status).toBe(403);
  });

  it("retorna 200 con la información del sistema para el rol contador", async () => {
    const res = await request(app).get("/api/configuracion/sistema").set("Authorization", bearerFor({ rol: "contador" }));

    expect(res.status).toBe(200);
    expect(res.body.language).toBe("Español");
  });

  it("retorna la configuración de tienda por defecto cuando no existe registro previo", async () => {
    prismaMock.current.configuracionTienda.findUnique.mockResolvedValue(null);
    prismaMock.current.configuracionTienda.create.mockResolvedValue({
      nombre: "Grain Store",
      nit: "900123456-1",
      direccion: "Cra 5 #12-34, Ibagué",
      telefono: "300 123 4567",
      correo: "contacto@grainstore.com",
      moneda: "COP",
      densidadDashboard: "Cómoda",
      alertaStockBajo: "10 unidades",
      modoVisual: "Claro / Oscuro",
    });

    const res = await request(app).get("/api/configuracion/tienda").set("Authorization", bearerFor({ rol: "admin" }));

    expect(res.status).toBe(200);
    expect(res.body.company.name).toBe("Grain Store");
  });
});
