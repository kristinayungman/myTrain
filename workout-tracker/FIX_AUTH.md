# Исправление ошибки 403 (Permission denied)

## Проблема
GitHub отклонил доступ, потому что:
- Вы авторизованы под аккаунтом `kristinayungman`
- А пытаетесь пушить в репозиторий `kristina03030609/TrainMy`

## Решения

### Вариант 1: Проверить, существует ли репозиторий TrainMy

1. Откройте в браузере: https://github.com/kristina03030609/TrainMy
2. Если репозиторий не существует - создайте его:
   - Перейдите: https://github.com/new
   - Название: `TrainMy`
   - Выберите Public или Private
   - НЕ добавляйте README, .gitignore, лицензию
   - Нажмите "Create repository"

### Вариант 2: Использовать правильный аккаунт

Если репозиторий принадлежит аккаунту `kristina03030609`, нужно:
1. Выйти из GitHub в браузере
2. Войти под аккаунтом `kristina03030609`
3. Настроить аутентификацию Git

### Вариант 3: Настроить Personal Access Token (рекомендуется)

1. Создайте токен доступа:
   - Перейдите: https://github.com/settings/tokens
   - Нажмите "Generate new token" → "Generate new token (classic)"
   - Название: `workout-tracker`
   - Выберите права: `repo` (все галочки в разделе repo)
   - Нажмите "Generate token"
   - **Скопируйте токен** (он показывается только один раз!)

2. Используйте токен вместо пароля:
   ```bash
   git push -u origin main
   ```
   - Username: `kristina03030609`
   - Password: вставьте токен (не пароль!)

### Вариант 4: Использовать SSH (более безопасно)

1. Проверьте, есть ли SSH ключ:
   ```bash
   ls ~/.ssh
   ```

2. Если нет ключа, создайте:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

3. Добавьте ключ в GitHub:
   - Скопируйте публичный ключ: `cat ~/.ssh/id_ed25519.pub`
   - Перейдите: https://github.com/settings/keys
   - Нажмите "New SSH key"
   - Вставьте ключ

4. Измените URL на SSH:
   ```bash
   git remote set-url origin git@github.com:kristina03030609/TrainMy.git
   git push -u origin main
   ```

### Вариант 5: Использовать существующий репозиторий dnevnicz_trn

Если у вас есть доступ к `dnevnicz_trn`, можно использовать его:
```bash
git remote set-url origin https://github.com/kristina03030609/dnevnicz_trn.git
git push -u origin main
```

## Быстрое решение (если репозиторий TrainMy не существует)

1. Создайте репозиторий на GitHub: https://github.com/new
   - Название: `TrainMy`
   - Public или Private
   - НЕ добавляйте файлы

2. Используйте Personal Access Token:
   ```bash
   git push -u origin main
   ```
   - Username: `kristina03030609`
   - Password: ваш Personal Access Token

