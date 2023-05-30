import express, { Request, Response } from 'express';

import client from 'prom-client';
import logger from './logger';

const app = express();

export const restResponseTimeHistogram = new client.Histogram({
  name: 'rest_response_time_duration_seconds',
  help: 'REST API response time in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

export const databaseResponseTimeHistogram = new client.Histogram({
  name: 'db_response_time_duration_seconds',
  help: 'Database response time in seconds',
  labelNames: ['operation', 'success'],
});

export function startMetricServer() {
  const port = 9100;

  const collectDefaultMetrics = client.collectDefaultMetrics;

  collectDefaultMetrics();

  app.get('/metrics', async (_req: Request, res: Response) => {
    res.set('Content-Type', client.register.contentType);

    res.send(await client.register.metrics());
  });

  app.listen(port, () => {
    logger.info(`metrics server started at http://localhost:${port}`);
  });
}
