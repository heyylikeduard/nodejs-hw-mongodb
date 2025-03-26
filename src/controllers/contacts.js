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
export const updateContact = async (req, res) => {
  const { file, user, params: { contactId }, body } = req;
  const updateData = { ...body };

  try {
    // Знаходимо старий контакт
    const oldContact = await Contact.findOne({ _id: contactId, userId: user._id });

    if (!oldContact) {
      console.log('Contact not found for:', {
        contactId,
        userId: user._id
      });
      throw new createHttpError(404, 'Contact not found');
    }

    if (file) {
      // Завантажуємо нове фото
      updateData.photo = await uploadToCloudinary(file.path);

      // Видаляємо старе фото з Cloudinary
      if (oldContact.photo) {
        const publicId = oldContact.photo.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Оновлюємо контакт
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, userId: user._id },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 200,
      data: updatedContact
    });

  } catch (error) {
    console.error('Update error details:', {
      error: error.message,
      stack: error.stack
    });
    throw new createHttpError(500, 'Failed to update contact');
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
