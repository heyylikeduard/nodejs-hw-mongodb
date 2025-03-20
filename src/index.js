import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

async function startApp() {
  await initMongoConnection(); // Чекаємо на підключення до MongoDB
  setupServer(); // Запускаємо сервер
}

startApp();


// new branch hw5
