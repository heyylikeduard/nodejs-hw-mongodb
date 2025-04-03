import { Contact } from '../models/contactModel.js';

// Отримання всіх контактів з пагінацією, сортуванням та фільтрацією
export const listContacts = async (
  userId,
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  filter = {}
) => {
  const skip = (page - 1) * perPage;

  // Додаємо userId до фільтра
  const finalFilter = { ...filter, userId };

  const totalItems = await Contact.countDocuments(finalFilter);
  const totalPages = Math.ceil(totalItems / perPage);

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const contacts = await Contact.find(finalFilter)
    .sort(sortOptions)
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
export const getContactById = async (contactId, userId) => {
  return await Contact.findOne({ _id: contactId, userId });
};

// Створення нового контакту
export const addContact = async (contactData) => {
  const newContact = await Contact.create(contactData);
  return newContact;
};

// Оновлення контакту за ID
export const updateContactById = async (contactId, updateData, userId) => {
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactId, userId },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedContact) {
    throw new Error("Contact not found");
  }

  return updatedContact;
};

// Видалення контакту за ID
export const removeContactById = async (contactId, userId) => {
  const deletedContact = await Contact.findOneAndDelete({ _id: contactId, userId });
  return deletedContact;
};
