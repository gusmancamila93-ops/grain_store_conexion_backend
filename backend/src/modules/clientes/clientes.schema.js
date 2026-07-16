import { z } from "zod";
import { CUSTOMER_TYPES, CUSTOMER_STATUSES } from "#utils/constants.js";

export const listClientesSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    tipo: z.string().trim().optional(),
    estado: z.string().trim().optional(),
  }),
});

export const createClienteSchema = z.object({
  body: z.object({
    document: z.string().trim().min(1, "El documento es obligatorio."),
    name: z.string().trim().min(1, "El nombre es obligatorio."),
    phone: z.string().trim().min(1, "El teléfono es obligatorio."),
    email: z.string().trim().email("Correo inválido."),
    address: z.string().trim().min(1, "La dirección es obligatoria."),
    type: z.enum(CUSTOMER_TYPES).default("Minorista"),
    status: z.enum(CUSTOMER_STATUSES).default("Activo"),
  }),
});

export const updateClienteSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    document: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    address: z.string().trim().min(1).optional(),
    type: z.enum(CUSTOMER_TYPES).optional(),
    status: z.enum(CUSTOMER_STATUSES).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});
