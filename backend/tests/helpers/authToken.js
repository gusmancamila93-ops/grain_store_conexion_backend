import { signToken } from "#utils/jwt.js";

export function bearerFor({ id = 1, rol = "admin", nombre = "Usuario Test" } = {}) {
  return `Bearer ${signToken({ id, rol, nombre })}`;
}
