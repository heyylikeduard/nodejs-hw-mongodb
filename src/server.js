import express from 'express';
import cors from 'cors';
import pino from 'pino';
import dotenv from 'dotenv';
import { getContacts, getContact } from './controllers/contactsController.js'; // Імпортуємо новий контролер

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

  // Логування запитів
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Роут для отримання всіх контактів
  app.get('/contacts', getContacts);

  // Роут для отримання контакту за ID
  app.get('/contacts/:contactId', getContact);

  // Обробка неіснуючих роутів
  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  // Запуск сервера
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}
