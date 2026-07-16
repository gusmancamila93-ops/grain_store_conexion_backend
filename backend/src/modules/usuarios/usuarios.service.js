import { prisma } from "#config/db.js";
import { ApiError } from "#utils/ApiError.js";
import { hashPassword } from "#utils/password.js";

function toPublicUsuario(usuario) {
  return {
    id: usuario.id,
    name: usuario.nombre,
    email: usuario.correo,
    role: usuario.rol,
    status: usuario.estado,
    phone: usuario.telefono,
  };
}

async function list() {
  const usuarios = await prisma.usuario.findMany({ orderBy: { createdAt: "desc" } });
  return usuarios.map(toPublicUsuario);
}

async function create(data) {
  const passwordHash = await hashPassword(data.password);
  const usuario = await prisma.usuario.create({
    data: {
      nombre: data.name,
      correo: data.email,
      passwordHash,
      rol: data.role,
      estado: data.status,
      telefono: data.phone,
    },
  });
  return toPublicUsuario(usuario);
}

async function update(id, data) {
  const existing = await prisma.usuario.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Usuario no encontrado.");
  }

  const passwordHash = data.password ? await hashPassword(data.password) : undefined;

  const usuario = await prisma.usuario.update({
    where: { id },
    data: {
      nombre: data.name,
      correo: data.email,
      rol: data.role,
      estado: data.status,
      telefono: data.phone,
      passwordHash,
    },
  });
  return toPublicUsuario(usuario);
}

async function remove(id) {
  const existing = await prisma.usuario.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Usuario no encontrado.");
  }
  await prisma.usuario.delete({ where: { id } });
}

export const usuariosService = { list, create, update, remove };
