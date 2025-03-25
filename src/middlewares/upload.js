import multer from 'multer';
import { HttpError } from 'http-errors';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new HttpError(400, 'Only images are allowed'));
  },
});

export const uploadPhoto = upload.single('photo');
