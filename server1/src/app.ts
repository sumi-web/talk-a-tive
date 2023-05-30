import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { asyncHandler } from './middleware/async.middleware';
import { requestLogger } from './middleware/request.middleware';
import { apiRules } from './middleware/rules.middleware';
import { errorHandler } from './utils/errorHandler';
import cors from 'cors';
import router from './routes/index.route';
import cookieParser from 'cookie-parser';
import logger from './utils/logger';
import responseTime from 'response-time';
import { restResponseTimeHistogram } from './utils/metrics';
import { Environment } from './config/environment';
import swaggerDocs from './utils/swagger';

const app = express();

/** Middlewares */
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(helmet());
app.use(cookieParser());
app.use(requestLogger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(apiRules);
app.use(
  responseTime((req: Request, res: Response, time: number) => {
    if (req?.route?.path) {
      // one way to use histogram
      restResponseTimeHistogram.observe(
        {
          method: req.method,
          route: req.route.path,
          status_code: res.statusCode,
        },
        time * 1000,
      );
    }
  }),
);

/** Configuring Session */
// app.use(configureSession());

/** configuring all routes */
app.use('/api/v1', router);

/** Swagger config */
swaggerDocs(app);

/** HealthCheck */

/**
 * @openapi
 * /healthcheck:
 *  get:
 *     tags:
 *     - Healthcheck
 *     description: Responds if the app is up and running
 *     responses:
 *       200:
 *         description: App is up and running with ram and memory usage info
 */
app.get(
  '/healthcheck',
  asyncHandler(async (_req: Request, res: Response) => {
    const jsMemory = Math.round(process.memoryUsage().heapUsed / (1024 * 1024));
    const ram = Math.round(process.memoryUsage().rss / (1024 * 1024));

    res.status(200).json({
      isProd: Environment.IS_PROD,
      uptime: process.uptime(),
      memory: {
        node: `${jsMemory}MB`,
        totalApp: `${ram}MB`,
      },
      message: 'welcome to Talk a tive',
    });
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
