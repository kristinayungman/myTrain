# 🚀 Быстрый старт

## Что уже настроено

✅ Токен бота: `8548684048:AAGijoaH1gUV3UiPKuAcpMPSFMYpHUSVP3A`  
✅ Бот-скрипт создан (`bot.js`)  
✅ GitHub Actions для автоматического деплоя  
✅ Приложение готово к работе с Telegram

## Шаги для запуска

### 1. Загрузите файлы в GitHub

```bash
git add .
git commit -m "Настройка Telegram Mini App"
git push origin main
```

### 2. Настройте GitHub Pages

1. Перейдите: https://github.com/kristina03030609/TrainMy/settings/pages
2. В разделе **Source** выберите **GitHub Actions**
3. Подождите 2-5 минут
4. Проверьте URL:
   - Если файлы в папке `workout-tracker/`: `https://kristina03030609.github.io/TrainMy/workout-tracker/`
   - Если файлы в корне репозитория: `https://kristina03030609.github.io/TrainMy/`

### 3. Настройте Mini App в BotFather

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/newapp`
3. Выберите вашего бота
4. Введите:
   - Название: **Трекер Тренировок**
   - URL: `https://kristina03030609.github.io/TrainMy/workout-tracker/` (или `/TrainMy/` если файлы в корне)

### 4. Настройте кнопку меню

1. Отправьте `/mybots` BotFather
2. Выберите вашего бота
3. Выберите **Bot Settings** → **Menu Button**
4. Выберите ваше Mini App

### 5. Готово! 🎉

Откройте бота в Telegram и нажмите на кнопку меню - приложение откроется!

## Дополнительно: Запуск бота (опционально)

Если хотите, чтобы бот отвечал на команды:

```bash
npm install
npm start
```

**Примечание:** Для постоянной работы бота нужен сервер (Heroku, Railway, Render и т.д.)

## Проблемы?

См. подробные инструкции в:
- `TELEGRAM_SETUP.md` - полная настройка Telegram
- `DEPLOY.md` - детали деплоя на GitHub Pages

