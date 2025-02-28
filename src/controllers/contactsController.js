import { listContacts, getContactById } from '../services/contacts.js';

// Отримання всіх контактів
export const getContacts = async (req, res) => {
  try {
    const contacts = await listContacts();

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  }
};

// Отримання контакту за ID
export const getContact = async (req, res) => {
  try {
    const { contactId } = req.params; // Отримуємо ID з параметрів запиту
    const contact = await getContactById(contactId); // Викликаємо сервіс

    if (!contact) {
      // Якщо контакт не знайдено
      return res.status(404).json({
        message: 'Contact not found',
      });
    }

    // Якщо контакт знайдено
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  }
};
