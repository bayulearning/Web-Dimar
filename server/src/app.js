import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { AppError } from "./utils/AppError.js";
import { apiRouter } from "./routes/index.js";
import { seoRouter } from "./routes/seo.routes.js";
import { csrfProtection } from "./middlewares/csrf.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { successResponse } from "./utils/apiResponse.js";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new AppError("Origin tidak diizinkan oleh kebijakan CORS", 403));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(csrfProtection);
app.use(requestLogger);

app.get("/", (_req, res) =>
  successResponse(res, {
    message: "Stride Athletics API",
    data: { version: "1.0.0", docs: "/api/health" },
  }),
);

app.use("/api", apiRouter);
app.use(seoRouter);

app.use(notFoundHandler);
app.use(errorHandler);
