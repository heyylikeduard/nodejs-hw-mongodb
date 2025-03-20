import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { Session } from '../models/sessionModel.js';

export const authenticate = async (req, res, next) => {
  // Отримання токена з заголовка Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createHttpError(401, 'Access token is missing or invalid');
  }

  const accessToken = authHeader.split(' ')[1]; // Вилучаємо токен з рядка "Bearer <token>"

  // Верифікація access токена
  let decoded;
  try {
    decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw createHttpError(401, 'Access token expired');
    }
    throw createHttpError(401, 'Invalid access token');
  }

  // Пошук сесії за access токеном
  const session = await Session.findOne({ accessToken });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  // Перевірка, чи не закічився термін дії access токена
  if (session.accessTokenValidUntil < new Date()) {
    throw createHttpError(401, 'Access token expired');
  }

  // Пошук користувача за ID
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  // Додаємо користувача до об'єкту запиту
  req.user = user;

  next();
};
