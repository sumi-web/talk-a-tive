import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';

export interface JwtPayloadData extends JwtPayload {
  userId: Types.ObjectId | string;
  role?: 'USER' | 'ADMIN';
}

class JWTHelper {
  public encode(data: JwtPayloadData, secret: string, expiresIn: number | string) {
    return jwt.sign(data, secret, { expiresIn: expiresIn });
  }

  public verify(token: string, secret: string) {
    try {
      return jwt.verify(token, secret);
    } catch (ex) {
      return false;
    }
  }
}

const jwtHelper = new JWTHelper();
export default jwtHelper;
