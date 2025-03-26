import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { Session } from '../models/sessionModel.js';
import {
  findUserByEmail,
  createUser,
  findSessionByRefreshToken,
  deleteSessionByRefreshToken,
} from '../services/auth.js';
import nodemailer from 'nodemailer';


// Реєстрація користувача
export const registerUser = async (req, res) => {
  const { email } = req.body;

  // Перевірка, чи існує користувач з таким email
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  // Створення нового користувача через сервіс
  const newUser = await createUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: newUser,
  });
};

// Логін користувача
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Пошук користувача за email
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid email or password');
  }

  // Перевірка пароля
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid email or password');
  }

  // Генерація токенів
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });

  // Видалення старої сесії, якщо вона існує
  await Session.deleteMany({ userId: user._id });

  // Створення нової сесії
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 хвилин
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 днів
  });

  // Запис рефреш токена в cookies
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
    secure: process.env.NODE_ENV === 'production', // Використовувати HTTPS у продакшені
  });

  // Відповідь з access токеном
  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken,
    },
  });
};

// Оновлення сесії
export const refreshSession = async (req, res) => {
  const { refreshToken } = req.cookies;

  // Перевірка наявності рефреш токена
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token is missing');
  }

  // Верифікація рефреш токена
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  // Пошук сесії за рефреш токеном
  const session = await findSessionByRefreshToken(refreshToken);
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  // Перевірка, чи не закічився термін дії рефреш токена
  if (session.refreshTokenValidUntil < new Date()) {
    throw createHttpError(401, 'Refresh token expired');
  }

  // Пошук користувача за ID
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  // Генерація нових токенів
  const newAccessToken = jwt.sign({ userId: user._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
  const newRefreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });

  // Видалення старої сесії
  await Session.deleteOne({ _id: session._id });

  // Створення нової сесії
  await Session.create({
    userId: user._id,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 хвилин
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 днів
  });

  // Запис нового рефреш токена в cookies
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
    secure: process.env.NODE_ENV === 'production', // Використовувати HTTPS у продакшені
  });

  // Відповідь з новим access токеном
  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: newAccessToken,
    },
  });
};

// Логаут користувача
export const logoutUser = async (req, res) => {
  const { refreshToken } = req.cookies;

  // Перевірка наявності рефреш токена
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token is missing');
  }

  // Видалення сесії через сервіс
  const deletedSession = await deleteSessionByRefreshToken(refreshToken);

  if (deletedSession.deletedCount === 0) {
    throw createHttpError(404, 'Session not found');
  }

  // Очищення cookies
  res.clearCookie('refreshToken');

  // Відповідь зі статусом 204 (без тіла)
  res.status(204).send();
};

// емейл
export const sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body;

  // 1. Перевірка, чи існує користувач
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  // 2. Генерація JWT токену (термін дії 5 хвилин)
  const resetToken = jwt.sign(
    { email },
    process.env.JWT_RESET_SECRET,
    { expiresIn: '5m' }
  );

  // 3. Формування посилання
  const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${resetToken}`;

  // 4. Налаштування транспортера Nodemailer (Brevo SMTP)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // 5. Відправка email
  try {
    await transporter.sendMail({
      from: `"Your App Name" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>Click the link below to reset your password (expires in 5 minutes):</p>
        <a href="${resetLink}">Reset Password</a>
      `,
    });
  } catch (error) {
    throw createHttpError(500, 'Failed to send the email, please try again later.');
  }

  // 6. Успішна відповідь
  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

// зміна паролю
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  // 1. Верифікація токену
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw createHttpError(401, 'Token is expired or invalid.');
    }
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  // 2. Пошук користувача за email з токену
  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  // 3. Хешування нового пароля
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 4. Оновлення паролю та видалення сесій
  await Promise.all([
    User.updateOne({ _id: user._id }, { password: hashedPassword }),
    Session.deleteMany({ userId: user._id }), // Видаляємо всі сесії
  ]);

  // 5. Відповідь
  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
