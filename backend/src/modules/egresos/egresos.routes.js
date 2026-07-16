import { Router } from "express";
import { authenticate } from "#middlewares/authenticate.js";
import { authorize } from "#middlewares/authorize.js";
import { validate } from "#middlewares/validate.js";
import {
  listEgresosSchema,
  createEgresoSchema,
  updateEgresoSchema,
  idParamSchema,
} from "#modules/egresos/egresos.schema.js";
import { list, create, update, remove } from "#modules/egresos/egresos.controller.js";

export const egresosRouter = Router();

egresosRouter.use(authenticate, authorize("admin", "contador"));

egresosRouter.get("/", validate(listEgresosSchema), list);
egresosRouter.post("/", validate(createEgresoSchema), create);
egresosRouter.put("/:id", validate(updateEgresoSchema), update);
egresosRouter.delete("/:id", validate(idParamSchema), remove);
