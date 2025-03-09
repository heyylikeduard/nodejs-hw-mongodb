import { Contact } from '../models/contactModel.js';

// Отримання всіх контактів
export const listContacts = async () => {
  const contacts = await Contact.find();
  return contacts;
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
