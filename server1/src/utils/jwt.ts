import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Environment } from '../config/environment';

interface JwtPayLoad {
  userId: Types.ObjectId | string;
  role: 'USER' | 'ADMIN';
}

class JWTHelper {
  public encode(data: JwtPayLoad, expiresIn = '60 days') {
    return jwt.sign(data, Environment.JWT_SECRET, { expiresIn, issuer: Environment.ISSUER });
  }

  public verify(token: string) {
    try {
      return jwt.verify(token, Environment.JWT_SECRET, { issuer: Environment.ISSUER, ignoreExpiration: false });
    } catch (ex) {
      return false;
    }
  }
}

const jwtHelper = new JWTHelper();
export default jwtHelper;
