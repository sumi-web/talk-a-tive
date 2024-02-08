import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import environment from './environment';
import logger from './logger';

abstract class Api {
  public send<T>(res: Response, data: T, statusCode: number = HttpStatusCode.Ok, message: string = 'success') {
    if (!environment.isDev()) {
      logger.info(JSON.stringify(data, null, 2));
    }

    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
}

export default Api;
