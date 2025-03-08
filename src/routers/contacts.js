import express from 'express';
import {
  getContacts,
  getContact,
  createContact,
  patchContact,
  deleteContact,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();

// Роут для отримання всіх контактів
router.get('/', ctrlWrapper(getContacts));

// Роут для отримання контакту за ID
router.get('/:contactId', ctrlWrapper(getContact));

// Роут для створення нового контакту
router.post('/', ctrlWrapper(createContact));

// Роут для оновлення контакту за ID
router.patch('/:contactId', ctrlWrapper(patchContact));

// Роут для видалення контакту за ID
router.delete('/:contactId', ctrlWrapper(deleteContact));

export default router;
