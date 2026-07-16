import { Router } from "express";
import { authenticate } from "#middlewares/authenticate.js";
import { authorize } from "#middlewares/authorize.js";
import { validate } from "#middlewares/validate.js";
import {
  listClientesSchema,
  createClienteSchema,
  updateClienteSchema,
  idParamSchema,
} from "#modules/clientes/clientes.schema.js";
import { list, create, update, remove } from "#modules/clientes/clientes.controller.js";

export const clientesRouter = Router();

clientesRouter.use(authenticate, authorize("admin", "vendedor", "contador"));

clientesRouter.get("/", validate(listClientesSchema), list);
clientesRouter.post("/", validate(createClienteSchema), create);
clientesRouter.put("/:id", validate(updateClienteSchema), update);
clientesRouter.delete("/:id", validate(idParamSchema), remove);
