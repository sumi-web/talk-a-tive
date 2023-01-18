import session from 'express-session';
import { User } from '../models/user.model';

export type ExcludeMethods<T> = Pick<T, { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]>;

declare module 'express-session' {
  export interface SessionData {
    userId: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      cookies: { token?: string };
      user: ExcludeMethods<User> | null;
    }
  }
}
