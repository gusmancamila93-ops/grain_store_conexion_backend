import { prisma } from "#config/db.js";
import { ApiError } from "#utils/ApiError.js";

function toPublicCliente(cliente) {
  return {
    id: cliente.id,
    document: cliente.documento,
    name: cliente.nombre,
    phone: cliente.telefono,
    email: cliente.correo,
    address: cliente.direccion,
    type: cliente.tipo,
    status: cliente.estado,
  };
}

function toDbData(body) {
  return {
    documento: body.document,
    nombre: body.name,
    telefono: body.phone,
    correo: body.email,
    direccion: body.address,
    tipo: body.type,
    estado: body.status,
  };
}

async function list({ search, tipo, estado }) {
  const clientes = await prisma.cliente.findMany({
    where: {
      AND: [
        tipo && tipo !== "Todos" ? { tipo } : {},
        estado && estado !== "Todos" ? { estado } : {},
        search
          ? {
              OR: [
                { documento: { contains: search } },
                { nombre: { contains: search } },
                { telefono: { contains: search } },
                { correo: { contains: search } },
                { direccion: { contains: search } },
              ],
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return clientes.map(toPublicCliente);
}

async function create(body) {
  const cliente = await prisma.cliente.create({ data: toDbData(body) });
  return toPublicCliente(cliente);
}

async function update(id, body) {
  const existing = await prisma.cliente.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Cliente no encontrado.");
  }
  const cliente = await prisma.cliente.update({ where: { id }, data: toDbData({ ...toPublicCliente(existing), ...body }) });
  return toPublicCliente(cliente);
}

async function remove(id) {
  const existing = await prisma.cliente.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Cliente no encontrado.");
  }
  await prisma.cliente.delete({ where: { id } });
}

export const clientesService = { list, create, update, remove };
