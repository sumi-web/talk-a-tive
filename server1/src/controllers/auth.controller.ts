import { Request, Response } from 'express';
import qs from 'qs';
import { Environment } from '../config/environment';
import { asyncHandler } from '../middleware/async.middleware';
import { User, UserModel } from '../models/user.model';
import { LoginUserInput, RegisterUserInput, RevokeUserAccessParamType } from '../schema/user.schema';
import { GoogleTokensResult, GoogleUserInfo } from '../types/types';
import { AppError, StatusCode } from '../utils/appError';
import jwtHelper, { JwtPayloadData } from '../utils/jwt';
import logger from '../utils/logger';
import { removeFile } from '../utils/removeFile';
import { revokeRefreshToken } from '../utils/revokeToken';
import argon2 from 'argon2';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { ExternalProviderModel, ProviderName } from '../models/externalProvider.model';
import { databaseResponseTimeHistogram } from '../utils/metrics';

/* Creating user */
export const registerUser = asyncHandler(async (req: Request<{}, {}, RegisterUserInput['body']>, res: Response) => {
  const metricsLabels = {
    operation: 'createProduct',
  };

  const timer = databaseResponseTimeHistogram.startTimer();

  const { name, email, password } = req.body;

  if (!name || !email || !req.file) {
    if (req.file) removeFile(req.file.path);

    throw new AppError({ message: 'Please enter all the fields', statusCode: StatusCode.BAD_REQUEST });
  }

  const alreadyUserExist = await UserModel.findOne({ email: req.body.email });

  if (alreadyUserExist) {
    /** check if image is stored, then deleting the saved image if user already exist */
    if (req.file) removeFile(req.file.path);

    throw new AppError({ message: `User already exist with email ${req.body.email}`, statusCode: StatusCode.BAD_REQUEST });
  }

  timer({ ...metricsLabels, success: 'true' });

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

  if (user.externalProvider) {
    res.status(StatusCode.BAD_REQUEST).json({ success: false, message: `Please sign in using below external services` });
  }

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
export const revokeUserAccess = asyncHandler(async (req: Request<RevokeUserAccessParamType['params']>, res: Response) => {
  const { userId } = req.params;

  const isUpdated = await revokeRefreshToken(userId);

  if (!isUpdated) {
    throw new AppError({ statusCode: StatusCode.NOT_FOUND, message: `User does not exist with given id ${userId}` });
  }

  res.status(StatusCode.OK).json({ success: true, message: 'revoked successfully' });
});

/** @description manage oAuth by google */

export const googleOAuthHandler = asyncHandler(async (req: Request, response: Response) => {
  // get the code from query string
  const code = req.query.code as string;

  const url = 'https://oauth2.googleapis.com/token';

  const values = {
    code,
    client_id: Environment.GOOGLE_CLIENT_ID,
    client_secret: Environment.GOOGLE_CLIENT_SECRET,
    redirect_uri: Environment.GOOGLE_AUTH_REDIRECT_URL,
    grant_type: 'authorization_code',
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: qs.stringify(values),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result: GoogleTokensResult = await res.json();

    if (result) {
      // get the id and access token with the code
      const { access_token } = result;

      // get user with tokens
      // const userDetails = jwt.decode(id_token);  this is also good approach, we can get user details from id_token which is base64

      const userInfo = await getGoogleUser(access_token);

      if (!userInfo.verified_email) {
        throw new AppError({ statusCode: StatusCode.FORBIDDEN, message: 'Google account is not verified' });
      }

      // upsert the user
      const externalProvider = await ExternalProviderModel.findOneAndUpdate(
        { providerToken: userInfo.id },
        {
          providerName: ProviderName.GOOGLE,
          providerToken: userInfo.id,
        },
        { upsert: true, new: true, runValidators: true },
      );

      const hashedPassword = await argon2.hash('___no_use___');

      const user = await findAndUpdateUser(
        { email: userInfo.email },
        { email: userInfo.email, name: userInfo.name, image: userInfo.picture, externalProvider: externalProvider._id, password: hashedPassword },
        { upsert: true, new: true, runValidators: true },
      );

      // create access & refresh token
      if (!user) {
        throw new AppError({ statusCode: StatusCode.INTERNAL_SERVER_ERROR, message: 'Something went wrong' });
      }

      const accessToken = jwtHelper.encodeAccessToken({ userId: user._id });
      const refreshToken = jwtHelper.encodeRefreshToken({ userId: user._id, version: 0 });

      //set cookies and redirect back to client
      return response
        .status(StatusCode.OK)
        .cookie(Environment.COOKIE_NAME, refreshToken, {
          maxAge: Environment.REFRESH_TOKEN_COOKIE_EXPIRY,
          httpOnly: Environment.IS_PROD,
          secure: Environment.IS_PROD,
          path: Environment.JWT_COOKIE_PATH,
        })
        .json({ success: true, data: { accessToken, ...user.toObject() } });
    }
    throw new AppError({ statusCode: StatusCode.INTERNAL_SERVER_ERROR, message: 'Something went wrong' });
  } catch (err) {
    logger.error(err);
    return response.redirect('https://localhost:3000/oauth/error');
  }

  // get id and access token with code => get google user with tokens => upsert user => create session and tokens => set cookies => redirect back to client
});

/** @description fetching user info using google's accessToken */
export const getGoogleUser = async (accessToken: string): Promise<GoogleUserInfo> => {
  const url = 'https://www.googleapis.com/oauth2/v2/userinfo';

  try {
    const res = await fetch(`${url}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await res.json();
    return result;
  } catch (err: any) {
    logger.error(err);
    throw new Error(err.message);
  }
};

export const facebookOAuthHandler = asyncHandler(async (req: Request, res: Response) => {
  console.log('req va', req.query);
  console.log('req param', req.params);
  const { code } = req.query;
  const result = await exchangeAccessTokenForCode(code as string);

  const getMeUrl = 'https://graph.facebook.com/me';

  try {
    const response = await fetch(`${getMeUrl}?access_token=${result.access_token}`);

    const myInfo = await response.json();

    // upsert the user
    const externalProvider = await ExternalProviderModel.findOneAndUpdate(
      { providerToken: 'unique' },
      {
        providerName: ProviderName.GOOGLE,
        providerToken: 'unique',
      },
      { upsert: true, new: true, runValidators: true },
    );

    const hashedPassword = await argon2.hash('___no_use___');

    const user = await findAndUpdateUser(
      { email: 'sumit26star@gmail.com' },
      {
        email: 'sumit26star@gmail.com',
        name: myInfo.name,
        image: '',
        externalProvider: externalProvider._id,
        password: hashedPassword,
      },
      { upsert: true, new: true, runValidators: true },
    );

    if (!user) {
      throw new AppError({ statusCode: StatusCode.INTERNAL_SERVER_ERROR, message: 'Something went wrong' });
    }

    const accessToken = jwtHelper.encodeAccessToken({ userId: user._id });
    const refreshToken = jwtHelper.encodeRefreshToken({ userId: user._id, version: 0 });

    return res
      .status(StatusCode.OK)
      .cookie(Environment.COOKIE_NAME, refreshToken, {
        maxAge: Environment.REFRESH_TOKEN_COOKIE_EXPIRY,
        httpOnly: Environment.IS_PROD,
        secure: Environment.IS_PROD,
        path: Environment.JWT_COOKIE_PATH,
      })
      .json({ success: true, data: { accessToken, ...user.toObject() } });
  } catch (err: any) {
    throw new Error(err);
  }
});

export const exchangeAccessTokenForCode = async (code: string) => {
  const url = 'https://graph.facebook.com/v16.0/oauth/access_token';

  const values = {
    client_id: Environment.FACEBOOK_CLIENT_ID,
    redirect_uri: Environment.FACEBOOK_AUTH_REDIRECT_URL,
    client_secret: Environment.FACEBOOK_SECRET,
    code,
  };

  try {
    const res = await fetch(`${url}?${qs.stringify(values)}`);

    return await res.json();
  } catch (err: any) {
    logger.error(err);
    throw new Error(err.message);
  }
};

const findAndUpdateUser = async (filter: FilterQuery<User>, update: UpdateQuery<User>, options: QueryOptions = {}) => {
  return UserModel.findOneAndUpdate(filter, update, options);
};

// change pass
// reset-pass
// update user data
// delete user
