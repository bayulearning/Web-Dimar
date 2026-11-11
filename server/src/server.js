import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const server = app.listen(env.PORT, () => {
  logger.info("server_started", {
    port: env.PORT,
    environment: env.NODE_ENV,
  });
});

function shutdown(signal) {
  logger.info("server_shutdown_requested", { signal });
  server.close((error) => {
    if (error) {
      logger.error("server_shutdown_failed", { message: error.message });
      process.exit(1);
    }
    logger.info("server_stopped");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.error("unhandled_rejection", { reason: String(reason) });
});
process.on("uncaughtException", (error) => {
  logger.error("uncaught_exception", { message: error.message, stack: error.stack });
  shutdown("uncaughtException");
});
