import express from 'express';
import helmet from 'helmet';
import { requestLogger } from './middleware/request.middleware';
import { apiRules } from './middleware/rules.middleware';
import { logger } from './utils/logger';

const app = express();

app.use(helmet());
app.use(requestLogger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(apiRules);

/** Routes */

/** HealthCheck */
app.get('/ping', (_, res) => {
  res.status(200).json({ message: 'ping' });
});

/** Error handling */
app.use((_req, res) => {
  const error = new Error('not found');

  logger.error(error);
  console.log(error);

  return res.status(404).json({ message: error.message });
});

export default app;
