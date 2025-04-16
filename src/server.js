import express from 'express';
import cors from 'cors';
import pino from 'pino';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

dotenv.config();

const logger = pino({
  transport: {
    target: 'pino-pretty',
  },
});

export function setupServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Логування запитів
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Swagger UI
  const swaggerFilePath = path.join(process.cwd(), 'docs/swagger.json');
  let swaggerDocument;
  try {
    swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf-8'));
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
  } catch (error) {
    logger.error('Failed to load Swagger documentation:', error.message);
  }

  // Роути
  app.use('/contacts', contactsRouter);
  app.use('/auth', authRouter);

  // Обробка помилок
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Запуск сервера
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}
