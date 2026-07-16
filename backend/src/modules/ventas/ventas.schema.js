import { z } from "zod";
import { PAYMENT_METHODS, SALE_STATUSES } from "#utils/constants.js";

export const listVentasSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    estado: z.string().trim().optional(),
  }),
});

const itemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a cero."),
  unitPrice: z.coerce.number().min(0),
});

export const createVentaSchema = z.object({
  body: z.object({
    customerId: z.coerce.number().int().positive(),
    date: z.string().trim().min(1, "La fecha es obligatoria."),
    paymentMethod: z.enum(PAYMENT_METHODS).default("Contado"),
    status: z.enum(SALE_STATUSES).default("Pagada"),
    items: z.array(itemSchema).min(1, "La venta debe tener al menos un producto."),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});
