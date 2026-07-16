import { Router } from "express";
import { authenticate } from "#middlewares/authenticate.js";
import { authorize } from "#middlewares/authorize.js";
import { validate } from "#middlewares/validate.js";
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  idParamSchema,
} from "#modules/usuarios/usuarios.schema.js";
import { list, create, update, remove } from "#modules/usuarios/usuarios.controller.js";

export const usuariosRouter = Router();

usuariosRouter.use(authenticate, authorize("admin"));

usuariosRouter.get("/", list);
usuariosRouter.post("/", validate(createUsuarioSchema), create);
usuariosRouter.put("/:id", validate(updateUsuarioSchema), update);
usuariosRouter.delete("/:id", validate(idParamSchema), remove);
