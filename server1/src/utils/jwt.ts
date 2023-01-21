import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Environment } from '../config/environment';

export interface JwtPayloadData extends JwtPayload {
  userId: Types.ObjectId | string;
  version?: number;
  role?: 'USER' | 'ADMIN';
}

class JWTHelper {
  public encodeAccessToken(data: JwtPayloadData) {
    return jwt.sign(data, Environment.ACCESS_JWT_SECRET, { expiresIn: Environment.ACCESS_JWT_EXPIRY });
  }

  public encodeRefreshToken(data: JwtPayloadData) {
    return jwt.sign(data, Environment.REFRESH_JWT_SECRET, { expiresIn: Environment.REFRESH_JWT_EXPIRY });
  }

  public verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, Environment.ACCESS_JWT_SECRET);
    } catch (ex) {
      return false;
    }
  }

  public verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, Environment.REFRESH_JWT_SECRET);
    } catch (ex) {
      return false;
    }
  }
}

const jwtHelper = new JWTHelper();
export default jwtHelper;
