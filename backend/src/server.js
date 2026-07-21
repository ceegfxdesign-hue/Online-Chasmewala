/**
 * Server entrypoint: validates env (on import), connects to MongoDB, starts the
 * HTTP server, and installs graceful-shutdown handlers.
 */
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './config/db.js';

async function bootstrap() {
  try {
    await connectDB();
  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 API ready at http://localhost:${env.PORT}${env.API_PREFIX} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal) => {
    logger.warn(`${signal} received — shutting down gracefully…`);
    server.close(async () => {
      await disconnectDB();
      logger.info('Closed remaining connections. Bye 👋');
      process.exit(0);
    });
    // Force-exit if it hangs.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });
}

bootstrap();
