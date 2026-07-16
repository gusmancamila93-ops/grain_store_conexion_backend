import { Router } from "express";
import { authenticate } from "#middlewares/authenticate.js";
import { authorize } from "#middlewares/authorize.js";
import { getReportes } from "#modules/reportes/reportes.controller.js";

export const reportesRouter = Router();

reportesRouter.get("/", authenticate, authorize("admin", "contador"), getReportes);
