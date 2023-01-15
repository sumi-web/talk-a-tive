import session from 'express-session';
import { Environment } from '../config/environment';

/** use this for session based authentication */
export const configureSession = () => {
  const expiry = 1000 * 60; // (1 day * 24hr/1day * 60min/1hr * 60sec/1min * 1000ms / 1 sec)

  //   const RedisStore = connectRedis(session);

  //   let redisClient = new Redis();

  return session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: true,
    name: Environment.COOKIE_NAME,
    cookie: {
      maxAge: expiry, //  change it to later 1day
      httpOnly: Environment.IS_PROD,
      sameSite: 'lax',
      secure: Environment.IS_PROD,
    },
  });
};
