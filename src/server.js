import express from 'express';
import cors from 'cors';
import pino from 'pino';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // Додаємо cookie-parser
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

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
  app.use(cookieParser()); // Підключаємо cookie-parser

  // Логування запитів
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Використання роутів для контактів
  app.use('/contacts', contactsRouter);

  // Використання роутів для аутентифікації
  app.use('/auth', authRouter);

  // Обробка неіснуючих роутів
  app.use(notFoundHandler);

  // Обробка помилок
  app.use(errorHandler);

  // Запуск сервера
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

// hw6 init
