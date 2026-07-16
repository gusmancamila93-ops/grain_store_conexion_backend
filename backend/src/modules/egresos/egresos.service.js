import { prisma } from "#config/db.js";
import { ApiError } from "#utils/ApiError.js";

function toPublicEgreso(egreso) {
  return {
    id: egreso.id,
    code: egreso.codigo,
    date: egreso.fecha.toISOString().slice(0, 10),
    category: egreso.categoria,
    description: egreso.descripcion,
    value: Number(egreso.valor),
    responsible: egreso.usuario?.nombre,
  };
}

async function nextCode() {
  const count = await prisma.egreso.count();
  return `EGR-${String(count + 1).padStart(3, "0")}`;
}

async function list({ search, categoria }) {
  const egresos = await prisma.egreso.findMany({
    where: {
      AND: [
        categoria && categoria !== "Todas" ? { categoria } : {},
        search
          ? {
              OR: [
                { codigo: { contains: search } },
                { descripcion: { contains: search } },
              ],
            }
          : {},
      ],
    },
    include: { usuario: true },
    orderBy: { createdAt: "desc" },
  });
  return egresos.map(toPublicEgreso);
}

async function create(body, usuarioId) {
  const codigo = await nextCode();
  const egreso = await prisma.egreso.create({
    data: {
      codigo,
      fecha: new Date(body.date),
      categoria: body.category,
      descripcion: body.description,
      valor: body.value,
      usuarioId,
    },
    include: { usuario: true },
  });
  return toPublicEgreso(egreso);
}

async function update(id, body) {
  const existing = await prisma.egreso.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Egreso no encontrado.");
  }
  const egreso = await prisma.egreso.update({
    where: { id },
    data: {
      fecha: body.date ? new Date(body.date) : undefined,
      categoria: body.category,
      descripcion: body.description,
      valor: body.value,
    },
    include: { usuario: true },
  });
  return toPublicEgreso(egreso);
}

async function remove(id) {
  const existing = await prisma.egreso.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Egreso no encontrado.");
  }
  await prisma.egreso.delete({ where: { id } });
}

export const egresosService = { list, create, update, remove };
