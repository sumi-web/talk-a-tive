import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // log the request
  logger.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

  res.on('finish', () => {
    logger.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
  });

  next();
};
