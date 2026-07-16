import { Router } from "express";
import { authenticate } from "#middlewares/authenticate.js";
import { authorize } from "#middlewares/authorize.js";
import { validate } from "#middlewares/validate.js";
import { listVentasSchema, createVentaSchema, idParamSchema } from "#modules/ventas/ventas.schema.js";
import { list, getById, create, remove } from "#modules/ventas/ventas.controller.js";

export const ventasRouter = Router();

ventasRouter.use(authenticate, authorize("admin", "vendedor"));

ventasRouter.get("/", validate(listVentasSchema), list);
ventasRouter.get("/:id", validate(idParamSchema), getById);
ventasRouter.post("/", validate(createVentaSchema), create);
ventasRouter.delete("/:id", validate(idParamSchema), remove);
