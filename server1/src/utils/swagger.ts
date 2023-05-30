import { Express, Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { version } from '../../package.json';
import { Environment } from '../config/environment';
import logger from './logger';

const options: swaggerJsdoc.OAS3Options = {
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API Docs',
      version,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/**/*.{js,ts}', './src/routes/auth.route.ts', './src/routes/index.route.ts', './src/schema*.{js,ts}', './src/app*.{js,ts}'],
};
const swaggerSpec = swaggerJsdoc(options);

export default function swaggerDocs(app: Express) {
  // Swagger page

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  logger.info(`Docs available at http://localhost:${Environment.SERVER_PORT}/docs`);
}
