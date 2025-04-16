import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    email: {
      type: String,
      default: null,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      required: [true, 'Contact type is required'],
      default: 'personal',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Посилання на модель User
      required: true,
    },
    photo: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Contact = mongoose.model('Contact', contactSchema);
