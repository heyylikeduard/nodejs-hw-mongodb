import express from 'express';
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { createContactSchema, updateContactSchema } from '../schemas/contacts.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadPhoto } from '../middlewares/upload.js';

const router = express.Router();

// Застосування middleware authenticate до всіх роутів контактів
router.use(authenticate);

// Роут для отримання всіх контактів
router.get('/', ctrlWrapper(getContacts));

// Роут для отримання контакту за ID
router.get('/:contactId', isValidId, ctrlWrapper(getContact));

// Роут для створення нового контакту
router.post(
  '/',
  authenticate,
  uploadPhoto,
  validateBody(createContactSchema),
  ctrlWrapper(createContact)
);

// Роут для оновлення контакту за ID
router.patch(
  '/:contactId',
  authenticate,
  isValidId,
  uploadPhoto,
  validateBody(updateContactSchema),
  ctrlWrapper(updateContact)
);

// Роут для видалення контакту за ID
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

export default router;
