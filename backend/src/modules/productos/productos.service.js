import { prisma } from "#config/db.js";
import { ApiError } from "#utils/ApiError.js";
import { getProductStatus } from "#utils/constants.js";

function toPublicProducto(producto) {
  const base = {
    id: producto.id,
    code: producto.codigo,
    name: producto.nombre,
    category: producto.categoria,
    stock: producto.stock,
    minStock: producto.stockMinimo,
    price: Number(producto.precio),
  };
  return { ...base, status: getProductStatus({ stock: base.stock, stockMinimo: base.minStock }) };
}

function toDbData(body) {
  return {
    codigo: body.code,
    nombre: body.name,
    categoria: body.category,
    stock: body.stock,
    stockMinimo: body.minStock,
    precio: body.price,
  };
}

async function list({ search, categoria, estado }) {
  const productos = await prisma.producto.findMany({
    where: {
      AND: [
        categoria && categoria !== "Todas" ? { categoria } : {},
        search
          ? {
              OR: [
                { codigo: { contains: search } },
                { nombre: { contains: search } },
                { categoria: { contains: search } },
              ],
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = productos.map(toPublicProducto);
  if (estado && estado !== "Todos") {
    return mapped.filter((producto) => producto.status === estado);
  }
  return mapped;
}

async function create(body) {
  const producto = await prisma.producto.create({ data: toDbData(body) });
  return toPublicProducto(producto);
}

async function update(id, body) {
  const existing = await prisma.producto.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Producto no encontrado.");
  }
  const merged = { ...toPublicProducto(existing), ...body };
  const producto = await prisma.producto.update({ where: { id }, data: toDbData(merged) });
  return toPublicProducto(producto);
}

async function remove(id) {
  const existing = await prisma.producto.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Producto no encontrado.");
  }
  await prisma.producto.delete({ where: { id } });
}

export const productosService = { list, create, update, remove, toPublicProducto };
