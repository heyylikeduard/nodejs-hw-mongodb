import { User } from '../models/userModel.js';
import { Session } from '../models/sessionModel.js';
import bcrypt from 'bcrypt';

// Пошук користувача за email
export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// Створення нового користувача
export const createUser = async (userData) => {
  const { name, email, password } = userData;

  // Хешування пароля
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Повертаємо користувача без пароля
  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };
};

// Пошук сесії за рефреш токеном
export const findSessionByRefreshToken = async (refreshToken) => {
  return await Session.findOne({ refreshToken });
};

// Видалення сесії за рефреш токеном
export const deleteSessionByRefreshToken = async (refreshToken) => {
  return await Session.deleteOne({ refreshToken });
};
