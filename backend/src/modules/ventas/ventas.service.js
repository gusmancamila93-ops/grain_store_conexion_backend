import { prisma } from "#config/db.js";
import { ApiError } from "#utils/ApiError.js";

function toSummary(venta) {
  return {
    id: venta.id,
    code: venta.codigo,
    customerId: venta.clienteId,
    customer: venta.cliente?.nombre,
    date: venta.fecha.toISOString().slice(0, 10),
    paymentMethod: venta.metodoPago,
    status: venta.estado,
    total: Number(venta.total),
    seller: venta.usuario?.nombre,
  };
}

function toDetail(venta) {
  return {
    ...toSummary(venta),
    items: venta.items.map((item) => ({
      productId: item.productoId,
      product: item.producto?.nombre,
      quantity: item.cantidad,
      unitPrice: Number(item.precioUnitario),
    })),
  };
}

async function nextCode() {
  const count = await prisma.venta.count();
  return `VEN-${String(count + 1).padStart(3, "0")}`;
}

async function list({ search, estado }) {
  const ventas = await prisma.venta.findMany({
    where: {
      AND: [
        estado && estado !== "Todos" ? { estado } : {},
        search
          ? {
              OR: [
                { codigo: { contains: search } },
                { cliente: { nombre: { contains: search } } },
              ],
            }
          : {},
      ],
    },
    include: { cliente: true, usuario: true },
    orderBy: { createdAt: "desc" },
  });
  return ventas.map(toSummary);
}

async function getById(id) {
  const venta = await prisma.venta.findUnique({
    where: { id },
    include: { cliente: true, usuario: true, items: { include: { producto: true } } },
  });
  if (!venta) {
    throw ApiError.notFound("Venta no encontrada.");
  }
  return toDetail(venta);
}

async function create(body, usuarioId) {
  const productos = await prisma.producto.findMany({
    where: { id: { in: body.items.map((item) => item.productId) } },
  });

  for (const item of body.items) {
    const producto = productos.find((p) => p.id === item.productId);
    if (!producto) {
      throw ApiError.badRequest(`Producto ${item.productId} no existe.`, "PRODUCT_NOT_FOUND");
    }
    if (producto.stock < item.quantity) {
      throw ApiError.badRequest(
        `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock}).`,
        "INSUFFICIENT_STOCK",
      );
    }
  }

  const total = body.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const codigo = await nextCode();

  const venta = await prisma.$transaction(async (tx) => {
    const created = await tx.venta.create({
      data: {
        codigo,
        clienteId: body.customerId,
        usuarioId,
        fecha: new Date(body.date),
        metodoPago: body.paymentMethod,
        estado: body.status,
        total,
        items: {
          create: body.items.map((item) => ({
            productoId: item.productId,
            cantidad: item.quantity,
            precioUnitario: item.unitPrice,
          })),
        },
      },
      include: { cliente: true, usuario: true, items: { include: { producto: true } } },
    });

    for (const item of body.items) {
      await tx.producto.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return toDetail(venta);
}

async function remove(id) {
  const venta = await prisma.venta.findUnique({ where: { id }, include: { items: true } });
  if (!venta) {
    throw ApiError.notFound("Venta no encontrada.");
  }

  await prisma.$transaction(async (tx) => {
    for (const item of venta.items) {
      await tx.producto.update({
        where: { id: item.productoId },
        data: { stock: { increment: item.cantidad } },
      });
    }
    await tx.venta.delete({ where: { id } });
  });
}

export const ventasService = { list, getById, create, remove };
