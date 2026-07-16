import { Router } from "express";
import { authenticate } from "#middlewares/authenticate.js";
import { authorize } from "#middlewares/authorize.js";
import { validate } from "#middlewares/validate.js";
import { updateTiendaSchema } from "#modules/configuracion/configuracion.schema.js";
import { getTienda, updateTienda, getSistema } from "#modules/configuracion/configuracion.controller.js";

export const configuracionRouter = Router();

configuracionRouter.use(authenticate, authorize("admin", "contador"));

configuracionRouter.get("/tienda", getTienda);
configuracionRouter.put("/tienda", validate(updateTiendaSchema), updateTienda);
configuracionRouter.get("/sistema", getSistema);
