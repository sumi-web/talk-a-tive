import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async.middleware';
import { UserModel } from '../models/user.model';
import { AppError, StatusCode } from '../utils/appError';
import { removeFile } from '../utils/removeFile';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password || !req.file) {
    if (req.file) removeFile(req.file.path);

    throw new AppError({ message: 'Please enter all the fields', statusCode: StatusCode.BAD_REQUEST });
  }

  const alreadyUserExist = await UserModel.findOne({ email: req.body.email });

  if (alreadyUserExist) {
    /** check if image is stored, then deleting the saved image if user already exist */
    if (req.file) removeFile(req.file.path);

    throw new AppError({ message: `user already exist with email ${req.body.email}`, statusCode: StatusCode.BAD_REQUEST });
  }

  const user = await UserModel.create({
    name,
    email,
    password,
    image: req.file.path,
  });

  res.status(200).json({ success: true, data: user });
});
