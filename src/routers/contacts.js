import express from 'express';
import {
  getContacts,
  getContact,
  createContact,
  patchContact,
  deleteContact,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { createContactSchema, updateContactSchema } from '../schemas/contacts.js';

const router = express.Router();

// Роут для отримання всіх контактів
router.get('/', ctrlWrapper(getContacts));

// Роут для отримання контакту за ID
router.get('/:contactId', isValidId, ctrlWrapper(getContact));

// Роут для створення нового контакту
router.post('/', validateBody(createContactSchema), ctrlWrapper(createContact));

// Роут для оновлення контакту за ID
router.patch(
  '/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(patchContact)
);

// Роут для видалення контакту за ID
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

export default router;
