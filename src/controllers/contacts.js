import httpErrors from 'http-errors';
import {
  listContacts,
  getContactById,
  addContact,
  updateContactById,
  removeContactById,
} from '../services/contacts.js';

const { NotFound } = httpErrors;

// Отримання всіх контактів
export const getContacts = async (req, res) => {
  const user = req.user; // Отримуємо користувача з запиту
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type = null,
    isFavourite = null,
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const perPageNumber = parseInt(perPage, 10);

  // Додаємо фільтр за userId
  const filter = {};
  if (type) filter.contactType = type;
  if (isFavourite !== null) filter.isFavourite = isFavourite;

  const paginatedContacts = await listContacts(
    user._id, // Передаємо userId
    pageNumber,
    perPageNumber,
    sortBy,
    sortOrder,
    filter
  );

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: paginatedContacts,
  });
};

// Отримання контакту за ID
export const getContact = async (req, res) => {
  const user = req.user; // Отримуємо користувача з запиту
  const { contactId } = req.params;

  const contact = await getContactById(contactId, user._id); // Передаємо userId
  if (!contact) {
    throw new NotFound('Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

// Створення нового контакту
export const createContact = async (req, res) => {
  const { user, file } = req;
  let photoUrl = null;

  if (file) {
    photoUrl = await uploadToCloudinary(file.buffer);
  }

  const newContact = await addContact({
    ...req.body,
    userId: user._id,
    photo: photoUrl,
  });

  res.status(201).json({
    status: 201,
    message: 'Contact created successfully',
    data: newContact,
  });
};

// Оновлення контакту за ID
export const patchContact = async (req, res) => {
  const { contactId } = req.params;
  const { user, file } = req;
  const updateData = { ...req.body };

  if (file) {
    updateData.photo = await uploadToCloudinary(file.buffer);
  }

  const updatedContact = await updateContactById(contactId, updateData, user._id);
  if (!updatedContact) throw new NotFound('Contact not found');

  res.status(200).json({
    status: 200,
    message: 'Contact updated successfully',
    data: updatedContact,
  });
};

// Видалення контакту за ID
export const deleteContact = async (req, res) => {
  const user = req.user; // Отримуємо користувача з запиту
  const { contactId } = req.params;

  const deletedContact = await removeContactById(contactId, user._id); // Передаємо userId
  if (!deletedContact) {
    throw new NotFound('Contact not found');
  }

  res.status(204).send(); // Відповідь без тіла
};
