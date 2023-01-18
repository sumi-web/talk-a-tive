import { Request, Response } from 'express';
import { Environment } from '../config/environment';
import { asyncHandler } from '../middleware/async.middleware';
import { UserModel } from '../models/user.model';
import { AppError, StatusCode } from '../utils/appError';
import jwtHelper from '../utils/jwt';
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

    throw new AppError({ message: `User already exist with email ${req.body.email}`, statusCode: StatusCode.BAD_REQUEST });
  }

  const user = await UserModel.create({
    name,
    email,
    password,
    image: req.file.path,
  });

  // create access token
  const accessToken = jwtHelper.encode({ userId: user._id }, Environment.ACCESS_JWT_SECRET, Environment.ACCESS_JWT_EXPIRY);
  // create refresh token
  const refreshToken = jwtHelper.encode({ userId: user._id }, Environment.REFRESH_JWT_SECRET, Environment.REFRESH_JWT_EXPIRY);

  const { password: userPass, ...rest } = user.toObject();

  res
    .status(StatusCode.CREATED)
    .cookie(Environment.COOKIE_NAME, refreshToken, {
      maxAge: Environment.REFRESH_TOKEN_COOKIE_EXPIRY,
      httpOnly: Environment.IS_PROD,
      path: '/',
    })
    .json({ success: true, data: { ...rest, accessToken } });
});

/* Logging In */
export const logInUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!password || !email) {
    throw new AppError({ statusCode: StatusCode.BAD_REQUEST, message: 'Please enter all fields' });
  }

  const user = await UserModel.findOne({ email }).select('+password').exec();

  if (!user) throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: `Invalid email or password` });

  const isMatched = await user.comparePassword(password);

  if (!isMatched) throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'Invalid email or password' });

  // create access token
  const accessToken = jwtHelper.encode({ userId: user._id }, Environment.ACCESS_JWT_SECRET, Environment.ACCESS_JWT_EXPIRY);
  // create refresh token
  const refreshToken = jwtHelper.encode({ userId: user._id }, Environment.REFRESH_JWT_SECRET, Environment.REFRESH_JWT_EXPIRY);

  const { password: userPass, ...rest } = user.toObject();

  res
    .status(StatusCode.OK)
    .cookie(Environment.COOKIE_NAME, refreshToken, {
      maxAge: Environment.REFRESH_TOKEN_COOKIE_EXPIRY,
      httpOnly: Environment.IS_PROD,
      path: '/',
    })
    .json({ success: true, data: { ...rest, accessToken } });
});

/**
 * @description generating the new access token
 */
export const refreshToken = asyncHandler((req: Request, res: Response) => {
  console.log('here req goes', req.cookies);
});

export const me = asyncHandler((req: Request, res: Response) => {
  if (!!req.user) {
    res.status(StatusCode.OK).json({ success: true, data: req.user });
  }
});
