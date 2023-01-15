import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async.middleware';
import { UserModel } from '../models/user.model';
import { AppError, StatusCode } from '../utils/appError';
import { removeFile } from '../utils/removeFile';

/* Creating user */
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

  req.session.userId = user._id;

  const { password: userPass, ...rest } = user.toObject();

  res.status(StatusCode.CREATED).json({ success: true, data: { ...rest, token: '' } });
});

/* Logging In */
export const logInUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log('session', req.session);

  if (!password || !email) {
    throw new AppError({ statusCode: StatusCode.BAD_REQUEST, message: 'Please enter all fields' });
  }

  const user = await UserModel.findOne({ email }).select('+password').exec();

  if (!user) throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: `invalid email or password` });

  const isMatched = await user.comparePassword(password);

  if (!isMatched) throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'invalid email or password' });

  // create jwt token here

  const { password: userPass, ...rest } = user.toObject();

  req.session.userId = user._id;

  res.status(StatusCode.OK).json({ success: true, data: { ...rest, token: '' } });
});

export const refreshToken = asyncHandler((req: Request, res: Response) => {});

export const me = asyncHandler((_req: Request, _res: Response) => {
  // const user = await UserModel;
});
