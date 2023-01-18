import { NextFunction, Request, Response } from 'express';
import { Environment } from '../config/environment';
import { UserModel } from '../models/user.model';
import { AppError, StatusCode } from '../utils/appError';
import jwtHelper, { JwtPayloadData } from '../utils/jwt';
import { asyncHandler } from './async.middleware';

export const isAuthenticated = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'Authorization header is expected' });

  if (authHeader.startsWith('Bearer')) {
    const token = authHeader.replace('Bearer ', '');

    if (!token) throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'User not authorized' });
    try {
      const decoded = jwtHelper.verify(token, Environment.ACCESS_JWT_SECRET) as JwtPayloadData;

      console.log('decoded', decoded);

      if (!decoded) throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'User not authorized' });

      const user = await UserModel.findById(decoded.userId);

      if (!user) {
        throw new AppError({ statusCode: StatusCode.BAD_REQUEST, message: 'User does not exist' });
      }

      req.user = user;

      next();
    } catch (err) {
      next(err);
    }
  } else {
    throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'Authorization header must start with Bearer' });
  }
});

export const isAuthorized = () => {};
