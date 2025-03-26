import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { registerUser, loginUser, refreshSession, logoutUser } from '../controllers/auth.js'; // Додаємо logoutUser
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, loginUserSchema } from '../schemas/auth.js';
import { sendResetPasswordEmail } from '../controllers/auth.js';
import { resetPasswordEmailSchema } from '../schemas/auth.js';
import { resetPassword } from '../controllers/auth.js';
import { resetPasswordSchema } from '../schemas/auth.js';


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

// роут для емейла
router.post(
  '/send-reset-email',
  validateBody(resetPasswordEmailSchema),
  ctrlWrapper(sendResetPasswordEmail)
);

// зміна паролю
router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPassword)
);

export default router;
