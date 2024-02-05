import cors from 'cors';
import nocache from 'nocache';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
// import expressJSDocSwagger from 'express-jsdoc-swagger';
import environment from './lib/environment';
// import expressJSDocSwaggerConfig from './config/express-jsdoc-swagger.config';
import appConfig from './config/app.config';
import errorHandler from '@/middlewares/error-handler';
import prismaClient from '@/lib/prisma';
import home from './home';
import routes from '@/modules/index';

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.setMiddlewares();
    this.disableSettings();
    this.setRoutes();
    this.setErrorHandler();
    // this.initializeDocs();
  }

  private setMiddlewares(): void {
    this.express.use(cors());
    this.express.use(morgan('dev'));
    this.express.use(nocache());
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(helmet());
    this.express.use(express.static('public'));
  }

  private disableSettings(): void {
    this.express.disable('x-powered-by');
  }

  private setRoutes(): void {
    const {
      api: { version },
    } = appConfig;
    const { env } = environment;
    this.express.use('/', home);

    this.express.use(`/api/${version}/${env}`, routes);

    this.express.get('/healthcheck', async (_req: Request, res: Response, next) => {
      const jsMemory = Math.round(process.memoryUsage().heapUsed / (1024 * 1024));
      const ram = Math.round(process.memoryUsage().rss / (1024 * 1024));

      res.status(200).json({
        isProd: environment.isProd(),
        uptime: process.uptime(),
        memory: {
          node: `${jsMemory}MB`,
          totalApp: `${ram}MB`,
        },
        message: 'Welcome to Talk a tive',
      });
    });
  }

  private setErrorHandler(): void {
    this.express.use(errorHandler);
  }

  //   private initializeDocs(): void {
  //     expressJSDocSwagger(this.express)(expressJSDocSwaggerConfig);
  //   }

  public async connectPrisma(): Promise<void> {
    await prismaClient.$connect();
  }
}

const app = new App();
const server = app.express;

app.connectPrisma().catch((e) => {
  throw e;
});

export default server;
