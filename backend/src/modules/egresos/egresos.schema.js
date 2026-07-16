import { z } from "zod";
import { EXPENSE_CATEGORIES } from "#utils/constants.js";

export const listEgresosSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    categoria: z.string().trim().optional(),
  }),
});

export const createEgresoSchema = z.object({
  body: z.object({
    date: z.string().trim().min(1, "La fecha es obligatoria."),
    category: z.enum(EXPENSE_CATEGORIES),
    description: z.string().trim().min(1, "La descripción es obligatoria."),
    value: z.coerce.number().min(0),
  }),
});

export const updateEgresoSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    date: z.string().trim().min(1).optional(),
    category: z.enum(EXPENSE_CATEGORIES).optional(),
    description: z.string().trim().min(1).optional(),
    value: z.coerce.number().min(0).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});
