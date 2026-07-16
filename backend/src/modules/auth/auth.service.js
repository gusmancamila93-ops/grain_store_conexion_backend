import { prisma } from "#config/db.js";
import { ApiError } from "#utils/ApiError.js";
import { comparePassword } from "#utils/password.js";
import { signToken } from "#utils/jwt.js";

function toPublicUser(usuario) {
  return {
    id: usuario.id,
    name: usuario.nombre,
    email: usuario.correo,
    role: usuario.rol,
    status: usuario.estado,
    phone: usuario.telefono,
    photo: usuario.foto,
  };
}

async function login({ email, password, role }) {
  const usuario = await prisma.usuario.findUnique({ where: { correo: email } });

  if (!usuario || usuario.rol !== role) {
    throw ApiError.unauthorized("Credenciales inválidas para el rol seleccionado.");
  }

  if (usuario.estado !== "Activo") {
    throw ApiError.forbidden("Este usuario está inactivo.");
  }

  const validPassword = await comparePassword(password, usuario.passwordHash);
  if (!validPassword) {
    throw ApiError.unauthorized("Credenciales inválidas para el rol seleccionado.");
  }

  const token = signToken({ id: usuario.id, rol: usuario.rol, nombre: usuario.nombre });
  return { token, user: toPublicUser(usuario) };
}

async function getMe(userId) {
  const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!usuario) {
    throw ApiError.notFound("Usuario no encontrado.");
  }
  return toPublicUser(usuario);
}

async function updateMe(userId, data) {
  const usuario = await prisma.usuario.update({
    where: { id: userId },
    data: {
      nombre: data.name,
      telefono: data.phone,
      foto: data.photo,
    },
  });
  return toPublicUser(usuario);
}

export const authService = { login, getMe, updateMe };
