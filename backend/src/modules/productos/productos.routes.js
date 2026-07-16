import { Router } from "express";
import { authenticate } from "#middlewares/authenticate.js";
import { authorize } from "#middlewares/authorize.js";
import { validate } from "#middlewares/validate.js";
import {
  listProductosSchema,
  createProductoSchema,
  updateProductoSchema,
  idParamSchema,
} from "#modules/productos/productos.schema.js";
import { list, create, update, remove } from "#modules/productos/productos.controller.js";

export const productosRouter = Router();

productosRouter.use(authenticate, authorize("admin", "vendedor"));

productosRouter.get("/", validate(listProductosSchema), list);
productosRouter.post("/", validate(createProductoSchema), create);
productosRouter.put("/:id", validate(updateProductoSchema), update);
productosRouter.delete("/:id", validate(idParamSchema), remove);
