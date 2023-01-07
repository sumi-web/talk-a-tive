import dotenv from 'dotenv';
import { Server } from 'http';
import app from './app';
import { connectDatabase } from './config/db';
import { Environment } from './config/environment';
import { logger } from './utils/logger';

dotenv.config();

// handling uncaught exception -- this should be on top to catch all undefined variables errors
process.on('uncaughtException', (err: Error) => {
  logger.error(err.message);
  logger.warn('shutting down the server due to Uncaught Exception Error');
  process.exit(1);
});

let httpServer: Server;

// only start the server when mongodb is connected
connectDatabase()
  .then(() => {
    app.listen(Environment.SERVER_PORT, () => {
      logger.success(`db is connected and express server listening on port ${Environment.SERVER_PORT}`);
    });
  })
  .catch((err) => {
    logger.error('error in connecting database', err);
  });

// // handling unhandled promise rejection -- this should be in last
process.on('unhandledRejection', (err: Error) => {
  logger.error(err.message);
  logger.warn('shutting down the server due to Unhandled Promise Rejection');
  httpServer.close(() => process.exit(1));
});
