import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';

export const startServer = async () => {
  const app: Application = express();

  //   middlewares
  app.use(cors());
  app.use(morgan('dev'));
  app.use(nocache());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet);
  app.use(express.static('public'));
};
