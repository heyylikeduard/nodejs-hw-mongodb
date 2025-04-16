import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Посилання на модель User
      required: [true, 'User ID is required'],
    },
    accessToken: {
      type: String,
      required: [true, 'Access token is required'],
    },
    refreshToken: {
      type: String,
      required: [true, 'Refresh token is required'],
    },
    accessTokenValidUntil: {
      type: Date,
      required: [true, 'Access token valid until date is required'],
    },
    refreshTokenValidUntil: {
      type: Date,
      required: [true, 'Refresh token valid until date is required'],
    },
  },
  {
    timestamps: true, // Додає поля createdAt та updatedAt автоматично
    versionKey: false, // Вимикає поле __v
  }
);

export const Session = mongoose.model('Session', sessionSchema);
