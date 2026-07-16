import { prisma } from "#config/db.js";
import { ApiError } from "#utils/ApiError.js";
import { comparePassword } from "#utils/password.js";
import { signToken } from "#utils/jwt.js";

function toPublicUser(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    estado: usuario.estado,
    telefono: usuario.telefono,
    foto: usuario.foto,
  };
}

async function login({ correo, password, rol }) {
  const usuario = await prisma.usuario.findUnique({ where: { correo } });

  if (!usuario || usuario.rol !== rol) {
    throw ApiError.unauthorized("Credenciales inválidas para el rol seleccionado.");
  }

  if (usuario.estado !== "Activo") {
    throw ApiError.forbidden("Este usuario está inactivo.");
  }

  const validPassword = await comparePassword(password, usuario.passwordHash);
  if (!validPassword) {
    throw ApiError.unauthorized("Credenciales inválidas para el rol seleccionado.");
  }

  const token = signToken(usuario);
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
      nombre: data.nombre,
      telefono: data.telefono,
      foto: data.foto,
    },
  });
  return toPublicUser(usuario);
}

export const authService = { login, getMe, updateMe };
