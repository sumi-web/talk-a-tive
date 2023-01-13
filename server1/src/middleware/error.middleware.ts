import { Response } from 'express';
import multer from 'multer';
import { AppError, StatusCode } from '../utils/appError';

export const errorMiddleWare = (err: any, res: Response) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // handle wrong mongodb id
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid ${err.path}`;
    err = new AppError({ message, statusCode: StatusCode.BAD_REQUEST });
  }

  // mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new AppError({ message, statusCode: StatusCode.BAD_REQUEST });
  }

  // wrong JWT error
  if (err.name === 'jsonWebTokenError') {
    const message = `Json web token is invalid, try again`;
    err = new AppError({ message, statusCode: StatusCode.BAD_REQUEST });
  }

  //  JWT expire error
  if (err.name === 'TokenExpiredError') {
    const message = `Json web token is expired, try again`;
    err = new AppError({ message, statusCode: StatusCode.BAD_REQUEST });
  }

  // multer error
  if (err instanceof multer.MulterError) {
    console.log('multer error', err);
  }

  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      ...err,
    },
  });
};
