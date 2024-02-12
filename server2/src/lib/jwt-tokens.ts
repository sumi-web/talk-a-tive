import { DayJs } from '@/utils/dayjs';
import { Token, TokenType } from '@prisma/client';

import jwt from 'jsonwebtoken';
import prisma from './prisma';
import { JWT_SECRET_KEY } from '@/utils/constants';
import { ApiError } from './errors';
import { HttpStatusCode } from 'axios';
import { AuthTokensResponse } from '@/types/common.type';
import appConfig from '@/config/app.config';

interface IJwtTokens {
  generateToken: (val: IGenToken) => string;
  saveToken: (val: ISaveToken) => Promise<Token>;

  verifyToken: (token: string, type: TokenType) => Promise<Token>;

  generateAuthTokens: (userId: number) => Promise<AuthTokensResponse>;
}

interface IGenToken {
  id: number;
  expires: Date | string;
  secret?: string;
  type: TokenType;
}

interface ISaveToken {
  userId: number;
  expires: Date | string;
  token: string;
  blacklisted?: boolean;
  type: TokenType;
}

class JwtToken implements IJwtTokens {
  public generateToken({ id, expires, secret = JWT_SECRET_KEY, type }: IGenToken) {
    const payload = {
      sub: id,
      exp: DayJs(expires).unix(),
      iat: Date.now(), // issued at
      type,
    };

    console.log('please keep unix here with type', type, DayJs(expires).unix());

    return jwt.sign(payload, secret);
  }

  public async saveToken({ token, blacklisted = false, expires, type, userId }: ISaveToken) {
    const createdToken = prisma.token.create({
      data: {
        userId,
        type,
        token,
        blacklisted,
        expires: DayJs(expires).utc().format(),
      },
    });

    return createdToken;
  }

  public async verifyToken(token: string, type: TokenType) {
    const payload = jwt.verify(token, JWT_SECRET_KEY);

    console.log('payload verifyToken', payload);
    const userId = Number(payload.sub);
    const tokenData = await prisma.token.findFirst({
      where: { token, type, userId, blacklisted: false },
    });

    if (!tokenData) {
      throw new Error('Token not found');
    }
    return tokenData;
  }

  public async generateAuthTokens(userId: number) {
    const accessTokenExpires = DayJs().add(appConfig.jwt.accessExpirationMinutes, 'minutes').utc().format();

    const accessToken = this.generateToken({ id: userId, expires: accessTokenExpires, type: TokenType.ACCESS });

    const refreshTokenExpires = DayJs().add(appConfig.jwt.refreshExpirationDays, 'days').utc().format();

    const refreshToken = this.generateToken({ id: userId, expires: refreshTokenExpires, type: TokenType.REFRESH });

    await this.saveToken({ token: refreshToken, userId: userId, expires: refreshTokenExpires, type: TokenType.REFRESH });

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires,
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires,
      },
    };
  }

  // generateResetPasswordToken = async (email: string): Promise<string> => {
  //   const user = await userService.getUserByEmail(email);
  //   if (!user) {
  //     throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  //   }
  //   const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  //   const resetPasswordToken = generateToken(user.id as number, expires, TokenType.RESET_PASSWORD);
  //   await saveToken(resetPasswordToken, user.id as number, expires, TokenType.RESET_PASSWORD);
  //   return resetPasswordToken;
  // };

  // generateVerifyEmailToken = async (user: { id: number }): Promise<string> => {
  //   const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  //   const verifyEmailToken = generateToken(user.id, expires, TokenType.VERIFY_EMAIL);
  //   await saveToken(verifyEmailToken, user.id, expires, TokenType.VERIFY_EMAIL);
  //   return verifyEmailToken;
  // };
}

export default new JwtToken();
