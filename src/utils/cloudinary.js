import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import dotenv from 'dotenv';

// Завантажуємо змінні середовища
dotenv.config();

// Ініціалізація Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const uploadToCloudinary = async (filePath) => {
  try {
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING',
      folder: 'contacts'
    });

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'contacts',
      resource_type: 'auto'
    });

    await fs.unlink(filePath); // Видаляємо тимчасовий файл
    return result.secure_url;
  } catch (error) {
    await fs.unlink(filePath).catch(() => {}); // Видаляємо файл у разі помилки
    console.error('Cloudinary upload error details:', error);
    throw error;
  }
};
