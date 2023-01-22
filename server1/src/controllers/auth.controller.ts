import { Request, Response } from 'express';
import { Environment } from '../config/environment';
import { asyncHandler } from '../middleware/async.middleware';
import { UserModel } from '../models/user.model';
import { LoginUserInput, RegisterUserInput } from '../schema/user.schema';
import { AppError, StatusCode } from '../utils/appError';
import jwtHelper, { JwtPayloadData } from '../utils/jwt';
import { removeFile } from '../utils/removeFile';
import { revokeRefreshToken } from '../utils/revokeToken';

/* Creating user */
export const registerUser = asyncHandler(async (req: Request<{}, {}, RegisterUserInput['body']>, res: Response) => {
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
  const accessToken = jwtHelper.encodeAccessToken({ userId: user._id });
  // create refresh token
  const refreshToken = jwtHelper.encodeRefreshToken({ userId: user._id, version: 0 });

  const { password: userPass, ...rest } = user.toObject();

  res
    .status(StatusCode.CREATED)
    .cookie(Environment.COOKIE_NAME, refreshToken, {
      maxAge: Environment.REFRESH_TOKEN_COOKIE_EXPIRY,
      httpOnly: Environment.IS_PROD,
      secure: Environment.IS_PROD,
      path: Environment.JWT_COOKIE_PATH,
    })
    .json({ success: true, data: { ...rest, accessToken } });
});

/* Logging In */
export const logInUser = asyncHandler(async (req: Request<{}, {}, LoginUserInput['body']>, res: Response) => {
  const { email, password } = req.body;

  if (!password || !email) {
    throw new AppError({ statusCode: StatusCode.BAD_REQUEST, message: 'Please enter all fields' });
  }

  const user = await UserModel.findOne({ email }).select('+password').exec();

  if (!user) throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: `Invalid email or password` });

  const isMatched = await user.comparePassword(password);

  if (!isMatched) throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'Invalid email or password' });

  // create access token
  const accessToken = jwtHelper.encodeAccessToken({ userId: user._id });
  // create refresh token
  const refreshToken = jwtHelper.encodeRefreshToken({ userId: user._id, version: user.tokenVersion });

  const { password: userPass, ...rest } = user.toObject();

  res
    .status(StatusCode.OK)
    .cookie(Environment.COOKIE_NAME, refreshToken, {
      maxAge: Environment.REFRESH_TOKEN_COOKIE_EXPIRY,
      httpOnly: Environment.IS_PROD,
      secure: Environment.IS_PROD,
      path: Environment.JWT_COOKIE_PATH,
    })
    .json({ success: true, data: { ...rest, accessToken } });
});

/**
 * @description getting my details
 */
export const me = asyncHandler((req: Request, res: Response) => {
  if (!!req.user) {
    res.status(StatusCode.OK).json({ success: true, data: req.user });
  }
});

/**
 * @description generating the new access token
 */
export const createAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies[Environment.COOKIE_NAME];

  if (!refreshToken) {
    throw new AppError({
      statusCode: StatusCode.UNAUTHORIZED,
      message: 'Refresh token is missing',
    });
  }

  const isRefreshTokenVerified = jwtHelper.verifyRefreshToken(refreshToken) as JwtPayloadData;

  if (!isRefreshTokenVerified) {
    throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'Refresh token is expired or invalid' });
  }

  const user = await UserModel.findById(isRefreshTokenVerified.userId).exec();

  if (!user) {
    throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'User does not exist' });
  }

  // if version does not match, coming token is revoked

  if (user.tokenVersion !== isRefreshTokenVerified?.version) {
    throw new AppError({ statusCode: StatusCode.UNAUTHORIZED, message: 'Refresh token is revoked' });
  }

  const accessToken = jwtHelper.encodeAccessToken({ userId: user._id });

  // send new refreshToken if you want to increase life of refresh token

  res.status(StatusCode.OK).json({ success: true, data: { accessToken } });
});

/**
 * @description revoking refresh token
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const isUpdated = await revokeRefreshToken(req.user._id);

  if (!isUpdated) {
    throw new AppError({ statusCode: StatusCode.NOT_FOUND, message: 'User does not exist' });
  }

  res.clearCookie(Environment.COOKIE_NAME);

  res.status(StatusCode.OK).json({ success: true });
});

/**
 * Only Admin can access
 * @description revoking the user access
 */
export const revokeUserAccess = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const isUpdated = await revokeRefreshToken(userId);

  if (!isUpdated) {
    throw new AppError({ statusCode: StatusCode.NOT_FOUND, message: `User does not exist with given id ${userId}` });
  }

  res.status(StatusCode.OK).json({ success: true });
});

// change pass
// reset-pass
// update user data
// delete user
