import { z } from "zod";
import { ROLES, USER_STATUSES } from "#utils/constants.js";

export const createUsuarioSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio."),
    email: z.string().trim().toLowerCase().email("Correo inválido."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
    role: z.enum(ROLES),
    status: z.enum(USER_STATUSES).default("Activo"),
    phone: z.string().trim().optional(),
  }),
});

export const updateUsuarioSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(ROLES).optional(),
    status: z.enum(USER_STATUSES).optional(),
    phone: z.string().trim().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});
