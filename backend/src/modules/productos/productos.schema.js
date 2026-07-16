import { z } from "zod";
import { PRODUCT_CATEGORIES } from "#utils/constants.js";

export const listProductosSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    categoria: z.string().trim().optional(),
    estado: z.string().trim().optional(),
  }),
});

export const createProductoSchema = z.object({
  body: z.object({
    code: z.string().trim().min(1, "El código es obligatorio."),
    name: z.string().trim().min(1, "El nombre es obligatorio."),
    category: z.enum(PRODUCT_CATEGORIES).default("Otro"),
    stock: z.coerce.number().int().min(0),
    minStock: z.coerce.number().int().min(0),
    price: z.coerce.number().min(0),
  }),
});

export const updateProductoSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    code: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    category: z.enum(PRODUCT_CATEGORIES).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    minStock: z.coerce.number().int().min(0).optional(),
    price: z.coerce.number().min(0).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});
