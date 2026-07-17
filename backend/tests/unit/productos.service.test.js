import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPrismaMock } from "../helpers/prismaMock.js";

const prismaMock = vi.hoisted(() => ({ current: null }));

vi.mock("#config/db.js", () => ({
  get prisma() {
    return prismaMock.current;
  },
}));

const { productosService } = await import("#modules/productos/productos.service.js");

describe("productosService (lógica de negocio de inventario)", () => {
  beforeEach(() => {
    prismaMock.current = createPrismaMock();
  });

  it("calcula el estado 'Agotado' para un producto sin stock al listar", async () => {
    prismaMock.current.producto.findMany.mockResolvedValue([
      { id: 1, codigo: "PRD-001", nombre: "Arroz", categoria: "Arroz", stock: 0, stockMinimo: 5, precio: 3200, createdAt: new Date() },
    ]);

    const productos = await productosService.list({});

    expect(productos[0].status).toBe("Agotado");
  });

  it("filtra por estado calculado ('Bajo stock') después de mapear los productos", async () => {
    prismaMock.current.producto.findMany.mockResolvedValue([
      { id: 1, codigo: "PRD-001", nombre: "Arroz", categoria: "Arroz", stock: 2, stockMinimo: 5, precio: 3200, createdAt: new Date() },
      { id: 2, codigo: "PRD-002", nombre: "Frijol", categoria: "Frijol", stock: 40, stockMinimo: 5, precio: 4200, createdAt: new Date() },
    ]);

    const productos = await productosService.list({ estado: "Bajo stock" });

    expect(productos).toHaveLength(1);
    expect(productos[0].code).toBe("PRD-001");
  });

  it("lanza 404 al actualizar un producto que no existe", async () => {
    prismaMock.current.producto.findUnique.mockResolvedValue(null);

    await expect(productosService.update(999, { name: "Nuevo nombre" })).rejects.toMatchObject({ statusCode: 404 });
  });

  it("crea un producto traduciendo los campos públicos al esquema de base de datos", async () => {
    prismaMock.current.producto.create.mockResolvedValue({
      id: 5,
      codigo: "PRD-005",
      nombre: "Lenteja",
      categoria: "Lenteja",
      stock: 100,
      stockMinimo: 10,
      precio: 5000,
    });

    const producto = await productosService.create({
      code: "PRD-005",
      name: "Lenteja",
      category: "Lenteja",
      stock: 100,
      minStock: 10,
      price: 5000,
    });

    expect(prismaMock.current.producto.create).toHaveBeenCalledWith({
      data: { codigo: "PRD-005", nombre: "Lenteja", categoria: "Lenteja", stock: 100, stockMinimo: 10, precio: 5000 },
    });
    expect(producto.status).toBe("Normal");
  });
});
