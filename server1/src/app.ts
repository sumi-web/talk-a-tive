import express from 'express';
import helmet from 'helmet';
// import expressWinston from 'express-winston';
// import winston from 'winston';

const app = express();

app.use(helmet());

// app.use(
//   expressWinston.logger({
//     transports: [new winston.transports.Console()],
//     format: winston.format.combine(winston.format.colorize(), winston.format.json()),
//     colorize: true,
//   }),
// );

app.get('/', (_, res) => {
  res.send('Hello World!');
});

export default app;
