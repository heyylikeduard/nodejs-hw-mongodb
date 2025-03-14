import { Contact } from '../models/contactModel.js';

// Отримання всіх контактів з пагінацією, сортуванням та фільтрацією
export const listContacts = async (
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  type = null,
  isFavourite = null
) => {
  const skip = (page - 1) * perPage; // Розраховуємо скіп

  // Створюємо об'єкт для фільтрації
  const filter = {};
  if (type) filter.contactType = type;
  if (isFavourite !== null) filter.isFavourite = isFavourite;

  const totalItems = await Contact.countDocuments(filter); // Загальна кількість контактів з урахуванням фільтрації
  const totalPages = Math.ceil(totalItems / perPage); // Загальна кількість сторінок

  // Визначаємо порядок сортування
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const contacts = await Contact.find(filter)
    .sort(sortOptions) // Сортуємо за вказаним полем та порядком
    .skip(skip)
    .limit(perPage);

  return {
    data: contacts,
    page,
    perPage,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

// Отримання контакту за ID
export const getContactById = async (contactId) => {
  const contact = await Contact.findById(contactId);
  return contact;
};

// Створення нового контакту
export const addContact = async (contactData) => {
  const newContact = await Contact.create(contactData);
  return newContact;
};

// Оновлення контакту за ID
export const updateContactById = async (contactId, updateData) => {
  const updatedContact = await Contact.findByIdAndUpdate(contactId, updateData, {
    new: true, // Повертає оновлений документ
    runValidators: true, // Запускає валідацію Mongoose
  });
  return updatedContact;
};

// Видалення контакту за ID
export const removeContactById = async (contactId) => {
  const deletedContact = await Contact.findByIdAndDelete(contactId);
  return deletedContact;
};
