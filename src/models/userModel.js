import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      validate: {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), // Перевірка формату email
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
  },
  {
    timestamps: true, // Додає поля createdAt та updatedAt автоматично
    versionKey: false, // Вимикає поле __v
  }
);

export const User = mongoose.model('User', userSchema);
