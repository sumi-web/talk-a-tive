import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async.middleware';
import { UserModel } from '../models/user.model';
import { AppError, StatusCode } from '../utils/appError';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const alreadyUserExist = await UserModel.find({ email: req.body.email });

  if (alreadyUserExist) throw new AppError({ message: `user already exist with email ${req.body.email}`, statusCode: StatusCode.BAD_REQUEST });

  const user = await UserModel.create(req.body);

  res.status(200).json({ success: true, data: user });
});
