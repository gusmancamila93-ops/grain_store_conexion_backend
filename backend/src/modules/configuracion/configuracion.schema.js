import { z } from "zod";

export const updateTiendaSchema = z.object({
  body: z.object({
    nombre: z.string().trim().min(1).optional(),
    nit: z.string().trim().min(1).optional(),
    direccion: z.string().trim().min(1).optional(),
    telefono: z.string().trim().min(1).optional(),
    correo: z.string().trim().email().optional(),
    moneda: z.string().trim().optional(),
    densidadDashboard: z.string().trim().optional(),
    alertaStockBajo: z.string().trim().optional(),
    modoVisual: z.string().trim().optional(),
  }),
});
