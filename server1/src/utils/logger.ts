import pino from 'pino';

const LEVELS = {
  http: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
} as const;

// const streams = Object.keys(LEVELS).map((level) => {
//   return {
//     level: level,
//     stream: pino.destination(`${__dirname}/app-${level}.log`),
//   };
// });

const logger = pino({
  customLevels: LEVELS,
  useOnlyCustomLevels: true,
  level: 'http',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'hostname,pid',
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
    },
  },
});

export default logger;
