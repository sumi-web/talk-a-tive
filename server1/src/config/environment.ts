import dotenv from 'dotenv';
dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

export class Environment {
  public static readonly IS_PROD: boolean = process.env.NODE_ENV === 'production';
  public static readonly DB_NAME: string = process.env.DB_NAME || 'talkative';
  public static readonly MONGO_URL: string = this.IS_PROD
    ? `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.llcwi.mongodb.net/${this.DB_NAME}`
    : `mongodb://127.0.0.1/${this.DB_NAME}`;
  public static readonly SERVER_PORT: number = Number(process.env.PORT) || 5001;
  public static readonly ISSUER: string = process.env.ISSUER || '';
  public static readonly ACCESS_JWT_SECRET: string = process.env.ACCESS_JWT_SECRET || '8b3d388a6f2728ezp';
  public static readonly REFRESH_JWT_SECRET: string = process.env.REFRESH_JWT_SECRET || 'ae8713d42a71ccdd0';
  public static readonly COOKIE_NAME: string = 'talkativeRefreshJwt';
  public static readonly ACCESS_JWT_EXPIRY: number | string = 60 * 4; // 2min
  public static readonly REFRESH_JWT_EXPIRY: number | string = 60 * 10; // 5min
  public static readonly REFRESH_TOKEN_COOKIE_EXPIRY = 1000 * 60 * 5; //5 min
  public static readonly JWT_COOKIE_PATH = '/api/v1/auth/refresh-token';
  public static readonly GOOGLE_AUTH_REDIRECT_URL = process.env.GOOGLE_AUTH_REDIRECT_URL || '';
  public static readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
  public static readonly GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
}
