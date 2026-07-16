import { z } from "zod";

export const updateTiendaSchema = z.object({
  body: z.object({
    company: z
      .object({
        name: z.string().trim().min(1).optional(),
        nit: z.string().trim().min(1).optional(),
        address: z.string().trim().min(1).optional(),
        phone: z.string().trim().min(1).optional(),
        email: z.string().trim().email().optional(),
      })
      .optional(),
    preferences: z
      .object({
        currency: z.string().trim().optional(),
        dashboardDensity: z.string().trim().optional(),
        lowStockAlert: z.string().trim().optional(),
        visualMode: z.string().trim().optional(),
      })
      .optional(),
  }),
});
