import { Contact } from '../models/contactModel.js';

// Отримання всіх контактів
export const listContacts = async () => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    throw error;
  }
};

// Отримання контакту за ID
export const getContactById = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId);
    return contact;
  } catch (error) {
    throw error;
  }
};

// Створення нового контакту
export const addContact = async (contactData) => {
  try {
    const newContact = await Contact.create(contactData);
    return newContact;
  } catch (error) {
    throw error;
  }
};

// Оновлення контакту за ID
export const updateContactById = async (contactId, updateData) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(contactId, updateData, {
      new: true, // Повертає оновлений документ
      runValidators: true, // Запускає валідацію Mongoose
    });
    return updatedContact;
  } catch (error) {
    throw error;
  }
};

// Видалення контакту за ID
export const removeContactById = async (contactId) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(contactId);
    return deletedContact;
  } catch (error) {
    throw error;
  }
};
