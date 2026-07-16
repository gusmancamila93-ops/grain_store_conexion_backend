import { env } from "#config/env.js";

export const corsOptions = {
  origin: env.frontendUrl,
  credentials: true,
};
