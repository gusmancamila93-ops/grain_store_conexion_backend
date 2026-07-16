import { z } from "zod";
import { ROLES } from "#utils/constants.js";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email("Correo inválido."),
    password: z.string().min(1, "La contraseña es obligatoria."),
    role: z.enum(ROLES, { message: "Rol inválido." }),
  }),
});

export const updateMeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    phone: z.string().trim().nullable().optional(),
    photo: z.string().nullable().optional(),
  }),
});
