import multer from 'multer';
import { HttpError } from 'http-errors';

const storage = multer.diskStorage({
  destination: 'tmp/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new HttpError(400, 'Only images are allowed'), false);
      }
    } else {
      cb(null, true);
    }
  }
}).single('photo');
