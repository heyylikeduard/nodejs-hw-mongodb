import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { registerUser, loginUser, refreshSession, logoutUser } from '../controllers/auth.js'; // Додаємо logoutUser
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, loginUserSchema } from '../schemas/auth.js';

const router = express.Router();

// Роут для реєстрації нового користувача
router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUser)
);

// Роут для логіну користувача
router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUser)
);

// Роут для оновлення сесії
router.post('/refresh', ctrlWrapper(refreshSession));

// Роут для логауту
router.post('/logout', ctrlWrapper(logoutUser));

export default router;
