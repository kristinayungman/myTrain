// Telegram Bot для открытия Mini App
// Установите зависимости: npm install node-telegram-bot-api

const TelegramBot = require('node-telegram-bot-api');

// Замените на ваш токен бота
const BOT_TOKEN = '8548684048:AAGijoaH1gUV3UiPKuAcpMPSFMYpHUSVP3A';

// URL вашего приложения на GitHub Pages
// После настройки GitHub Pages замените на ваш реальный URL
// Например: https://kristina03030609.github.io/TrainMy/workout-tracker/
const WEB_APP_URL = 'https://kristina03030609.github.io/TrainMy/workout-tracker/';

// Создаем экземпляр бота
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Команда /start - приветствие и кнопка для открытия приложения
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: '🏋️ Открыть Трекер Тренировок',
                    web_app: { url: WEB_APP_URL }
                }
            ]]
        }
    };
    
    bot.sendMessage(chatId, '👋 Добро пожаловать в Трекер Тренировок!\n\nНажмите на кнопку ниже, чтобы открыть приложение:', options);
});

// Команда /app - открыть приложение
bot.onText(/\/app/, (msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: '🏋️ Открыть Трекер Тренировок',
                    web_app: { url: WEB_APP_URL }
                }
            ]]
        }
    };
    
    bot.sendMessage(chatId, 'Открыть приложение:', options);
});

// Обработка всех остальных сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Игнорируем команды
    if (text && text.startsWith('/')) {
        return;
    }
    
    // На любое сообщение предлагаем открыть приложение
    const options = {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: '🏋️ Открыть Трекер Тренировок',
                    web_app: { url: WEB_APP_URL }
                }
            ]]
        }
    };
    
    bot.sendMessage(chatId, 'Используйте команду /start или нажмите кнопку ниже, чтобы открыть приложение:', options);
});

console.log('🤖 Бот запущен и готов к работе!');

