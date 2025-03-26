import Joi from 'joi';

// Схема для реєстрації
export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Схема для логіну
export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// схема для емейла
export const resetPasswordEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

// схема для зміни паролю
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
});
