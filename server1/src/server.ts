// import { Server } from 'http';
import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/db';
import { Environment } from './config/environment';
import { logger } from './utils/logger';
dotenv.config();

// // handling uncaught exception -- this should be on top to catch all undefined variables errors
// // process.on('uncaughtException', (err: Error) => {
// //   Logger.error(err.message);
// //   Logger.warn('shutting down the server due to Uncaught Exception Error');
// //   process.exit(1);
// // });

// let httpServer: Server;

// // after connecting database start express and graphql server1
// connectDatabase().then(async () => {
//   //   const { app, apolloServer } = await startServer();
//   return;

//   httpServer = app.listen(Environment.serverPort, (): void => {
//     console.log(`express server successfully connected on port ${Environment.serverPort}`);
//     // console.log(`graphql server has started at ${Environment.serverPort}${apolloServer.graphqlPath}`);
//   });
// });

// // handling unhandled promise rejection -- this should be in last
// // process.on('unhandledRejection', (err: Error) => {
// //   Logger.error(err.message);
// //   Logger.warn('shutting down the server due to Unhandled Promise Rejection');
// //   httpServer.close(() => process.exit(1));
// // });

connectDatabase()
  .then(() => {
    console.log('db connected');
    app.listen(Environment.serverPort, () => {
      logger.success(`db is connected and express server listening on port ${Environment.serverPort}`);
    });
  })
  .catch((err) => {
    console.log('err occured', err);
  });
