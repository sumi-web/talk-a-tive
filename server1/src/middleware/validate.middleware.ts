import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { StatusCode } from '../utils/appError';
import { removeFile } from '../utils/removeFile';

import { asyncHandler } from './async.middleware';

export const validate = (schema: AnyZodObject) =>
  asyncHandler((req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (err: any) {
      if (req.file) removeFile(req.file.path);
      res.status(StatusCode.BAD_REQUEST).json({ success: false, error: err.errors });
    }
  });
