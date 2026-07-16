import { verifyToken } from "#utils/jwt.js";
import { ApiError } from "#utils/ApiError.js";
import { asyncHandler } from "#utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw ApiError.unauthorized("Debes iniciar sesión para continuar.");
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, rol: payload.rol, nombre: payload.nombre };
    next();
  } catch {
    throw ApiError.unauthorized("Sesión inválida o expirada.");
  }
});
