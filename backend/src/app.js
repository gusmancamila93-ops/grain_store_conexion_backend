import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { corsOptions } from "#config/cors.js";
import { env } from "#config/env.js";
import { notFoundHandler, errorHandler } from "#middlewares/errorHandler.js";
import { authRouter } from "#modules/auth/auth.routes.js";
import { usuariosRouter } from "#modules/usuarios/usuarios.routes.js";
import { clientesRouter } from "#modules/clientes/clientes.routes.js";
import { productosRouter } from "#modules/productos/productos.routes.js";
import { ventasRouter } from "#modules/ventas/ventas.routes.js";
import { egresosRouter } from "#modules/egresos/egresos.routes.js";
import { dashboardRouter } from "#modules/dashboard/dashboard.routes.js";
import { reportesRouter } from "#modules/reportes/reportes.routes.js";
import { configuracionRouter } from "#modules/configuracion/configuracion.routes.js";

export const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/productos", productosRouter);
app.use("/api/ventas", ventasRouter);
app.use("/api/egresos", egresosRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reportes", reportesRouter);
app.use("/api/configuracion", configuracionRouter);

app.use(notFoundHandler);
app.use(errorHandler);
