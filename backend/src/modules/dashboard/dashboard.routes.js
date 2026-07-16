import { Router } from "express";
import { authenticate } from "#middlewares/authenticate.js";
import { authorize } from "#middlewares/authorize.js";
import { getDashboard } from "#modules/dashboard/dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", authenticate, authorize("admin", "vendedor", "contador"), getDashboard);
