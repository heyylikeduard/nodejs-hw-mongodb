import httpErrors from 'http-errors';
import {
  listContacts,
  getContactById,
  addContact,
  updateContactById,
  removeContactById,
} from '../services/contacts.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import createHttpError from 'http-errors';
import { v2 as cloudinary } from 'cloudinary';
import { Contact } from '../models/contactModel.js';

const { NotFound } = httpErrors;

// Отримання всіх контактів
export const getContacts = async (req, res) => {
  const user = req.user; // Отримуємо користувача з запиту
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    contactType,
    type = null,
    isFavourite = null,
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const perPageNumber = parseInt(perPage, 10);

  // Додаємо фільтр за userId
  const filter = {};
  if (contactType) filter.contactType = contactType;
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
  const { file, user, body } = req;
  let photoUrl = null;

  if (file) {
    try {
      photoUrl = await uploadToCloudinary(file.path);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new createHttpError(500, 'Failed to upload photo to Cloudinary');
    }
  }

  try {
    const newContact = await addContact({
      ...body,
      userId: user._id,
      photo: photoUrl
    });

    res.status(201).json({
      status: 201,
      message: 'Contact created successfully',
      data: newContact
    });
  } catch (error) {
    console.error('Database error:', error);
    throw new createHttpError(500, 'Failed to create contact');
  }
};

// Оновлення контакту за ID
export const updateContact = async (req, res, next) => {
  const { file, user, params: { contactId }, body } = req;
  const updateData = { ...body };

  try {
    // Спроба оновити контакт через сервіс
    const updatedContact = await updateContactById(
      contactId,
      { ...updateData, userId: user._id },
      user._id
    );

    // Обробка фото, якщо воно є у запиті
    if (file) {
      try {
        // Завантаження нового фото
        const newPhotoUrl = await uploadToCloudinary(file.path);
        updateData.photo = newPhotoUrl;

        // Видалення старого фото з Cloudinary
        if (updatedContact.photo) {
          const publicId = updatedContact.photo
            .split('/')
            .slice(-2)
            .join('/')
            .split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }

        // Оновлення фото у контакті
        updatedContact.photo = newPhotoUrl;
        await updatedContact.save();
      } catch (error) {
        console.error('Cloudinary error:', error);
        throw new createHttpError(500, 'Failed to process image');
      }
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully updated contact!',
      data: updatedContact
    });

  } catch (error) {
    // Спеціальна обробка помилки "Contact not found"
    if (error.message === 'Contact not found') {
      return next(createHttpError(404, error.message));
    }

    // Інші помилки
    console.error('Update error:', error);
    next(error);
  }
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
