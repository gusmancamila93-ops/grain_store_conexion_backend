import { Router } from "express";
import { authenticate } from "#middlewares/authenticate.js";
import { validate } from "#middlewares/validate.js";
import { loginSchema, updateMeSchema } from "#modules/auth/auth.schema.js";
import { login, getMe, updateMe } from "#modules/auth/auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), login);
authRouter.get("/me", authenticate, getMe);
authRouter.put("/me", authenticate, validate(updateMeSchema), updateMe);
