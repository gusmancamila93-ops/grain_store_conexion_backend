import jwt from "jsonwebtoken";
import { env } from "#config/env.js";

export function signToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
