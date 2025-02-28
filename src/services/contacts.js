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
    const contact = await Contact.findById(contactId); // Шукаємо контакт за ID
    return contact;
  } catch (error) {
    throw error;
  }
};
