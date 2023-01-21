import { NextFunction, Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { AppError, StatusCode } from '../utils/appError';
import jwtHelper, { JwtPayloadData } from '../utils/jwt';
import { asyncHandler } from './async.middleware';
import { AuthRolesType } from '../models/user.model';

export const isAuthenticated = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'Authorization header is expected' });

  if (authHeader.startsWith('Bearer')) {
    const token = authHeader.replace('Bearer ', '');

    if (!token) throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'Token is missing' });

    const decoded = jwtHelper.verifyAccessToken(token) as JwtPayloadData;

    console.log('decoded', decoded);

    if (!decoded) throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'Token is invalid or expired' });

    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      throw new AppError({ statusCode: StatusCode.BAD_REQUEST, message: 'User does not exist' });
    }

    req.user = user;

    next();
  } else {
    throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'Authorization header must start with Bearer' });
  }
});

export const isAuthorized = (role: AuthRolesType) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (role !== req.user.role) {
      throw new AppError({ statusCode: StatusCode.FORBIDDEN, message: `${req.user.role} is not allowed to access this resource` });
    }
    next();
  });
