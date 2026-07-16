import { z } from "zod";
import { ROLES, USER_STATUSES } from "#utils/constants.js";

export const createUsuarioSchema = z.object({
  body: z.object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio."),
    correo: z.string().trim().toLowerCase().email("Correo inválido."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
    rol: z.enum(ROLES),
    estado: z.enum(USER_STATUSES).default("Activo"),
    telefono: z.string().trim().optional(),
  }),
});

export const updateUsuarioSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    nombre: z.string().trim().min(1).optional(),
    correo: z.string().trim().toLowerCase().email().optional(),
    password: z.string().min(6).optional(),
    rol: z.enum(ROLES).optional(),
    estado: z.enum(USER_STATUSES).optional(),
    telefono: z.string().trim().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});
