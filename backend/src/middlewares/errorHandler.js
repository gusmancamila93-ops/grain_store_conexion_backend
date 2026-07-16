import { ApiError } from "#utils/ApiError.js";
import { env } from "#config/env.js";

const PRISMA_UNIQUE_CONSTRAINT = "P2002";
const PRISMA_NOT_FOUND = "P2025";

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: "Ruta no encontrada.", code: "NOT_FOUND" } });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    res
      .status(err.statusCode)
      .json({ error: { message: err.message, code: err.code, details: err.details } });
    return;
  }

  if (err.code === PRISMA_UNIQUE_CONSTRAINT) {
    res.status(409).json({
      error: { message: "Ya existe un registro con ese valor único.", code: "DUPLICATE" },
    });
    return;
  }

  if (err.code === PRISMA_NOT_FOUND) {
    res.status(404).json({ error: { message: "Recurso no encontrado.", code: "NOT_FOUND" } });
    return;
  }

  if (env.nodeEnv !== "production") {
    console.error(err);
  }

  res.status(500).json({
    error: {
      message: "Error interno del servidor.",
      code: "INTERNAL_ERROR",
    },
  });
}
