import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPrismaMock } from "../helpers/prismaMock.js";

const prismaMock = vi.hoisted(() => ({ current: null }));

vi.mock("#config/db.js", () => ({
  get prisma() {
    return prismaMock.current;
  },
}));

const { reportesService } = await import("#modules/reportes/reportes.service.js");

describe("reportesService.getReports (cálculos financieros)", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
  });

  it("calcula ingresos, egresos y utilidad a partir de ventas pagadas y egresos registrados", async () => {
    prismaMock.current.venta.findMany.mockResolvedValue([
      {
        id: 1,
        estado: "Pagada",
        total: 100000,
        fecha: new Date(2026, 3, 10),
        clienteId: 1,
        cliente: { nombre: "Cliente A" },
        items: [{ cantidad: 2, producto: { nombre: "Arroz" } }],
      },
      {
        id: 2,
        estado: "Pendiente",
        total: 50000,
        fecha: new Date(2026, 3, 12),
        clienteId: 2,
        cliente: { nombre: "Cliente B" },
        items: [{ cantidad: 1, producto: { nombre: "Frijol" } }],
      },
    ]);
    prismaMock.current.egreso.findMany.mockResolvedValue([
      { fecha: new Date(2026, 3, 5), valor: 30000 },
    ]);

    const report = await reportesService.getReports();

    expect(report.totals.income).toBe(100000);
    expect(report.totals.expenses).toBe(30000);
    expect(report.totals.profit).toBe(70000);
    expect(report.totals.salesCount).toBe(2);
  });

  it("identifica el producto con mayor rotación y a los clientes con deuda pendiente", async () => {
    prismaMock.current.venta.findMany.mockResolvedValue([
      {
        estado: "Pagada",
        total: 20000,
        fecha: new Date(2026, 0, 1),
        clienteId: 1,
        cliente: { nombre: "Cliente A" },
        items: [{ cantidad: 10, producto: { nombre: "Arroz" } }],
      },
      {
        estado: "Pendiente",
        total: 15000,
        fecha: new Date(2026, 0, 2),
        clienteId: 2,
        cliente: { nombre: "Cliente B" },
        items: [{ cantidad: 3, producto: { nombre: "Frijol" } }],
      },
    ]);
    prismaMock.current.egreso.findMany.mockResolvedValue([]);

    const report = await reportesService.getReports();

    expect(report.topProducts[0].name).toBe("Arroz");
    expect(report.stats.find((s) => s.label === "Clientes con deuda").value).toBe(1);
  });
});
