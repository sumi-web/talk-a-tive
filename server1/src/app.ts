import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { asyncHandler } from './middleware/async.middleware';
import { requestLogger } from './middleware/request.middleware';
import { apiRules } from './middleware/rules.middleware';
import authRouter from './routes/auth.route';
import { errorHandler } from './utils/errorHandler';
import { logger } from './utils/logger';
import { generateUniqueKey } from './utils/uniqueId';

const app = express();

/** Middlewares */
app.use(helmet());
app.use(requestLogger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(apiRules);

/** Configuring Session */
// app.use(configureSession());

/** Routes */
app.use('/api/v1/auth/', authRouter);

/** HealthCheck */
app.get(
  '/ping',
  asyncHandler(async (_req: Request, res: Response) => {
    console.log('cookie', generateUniqueKey());

    res.status(200).json({ message: 'welcome to Talk a tive' });
  }),
);

/** Error middleware */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => errorHandler.handleError(err, res));

/** Page not found */
app.use('*', (_req, res) => {
  const error = new Error('page not found');

  logger.error(error);

  return res.status(404).json({ message: error.message });
});

export default app;
