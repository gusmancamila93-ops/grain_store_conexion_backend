import { z } from "zod";
import { ROLES } from "#utils/constants.js";

export const loginSchema = z.object({
  body: z.object({
    correo: z.string().trim().toLowerCase().email("Correo inválido."),
    password: z.string().min(1, "La contraseña es obligatoria."),
    rol: z.enum(ROLES, { message: "Rol inválido." }),
  }),
});

export const updateMeSchema = z.object({
  body: z.object({
    nombre: z.string().trim().min(1).optional(),
    telefono: z.string().trim().optional(),
    foto: z.string().optional(),
  }),
});
