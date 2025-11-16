# Исправление проблемы с Git

## Проблема
- Вы находитесь в ветке `style_pin`, а пытаетесь пушить в `main`
- Удаленный репозиторий настроен на `dnevnicz_trn` вместо `TrainMy`

## Решение

### Вариант 1: Переименовать ветку в main и пушить

```bash
# Переименовать текущую ветку в main
git branch -M main

# Проверить удаленный репозиторий
git remote -v

# Если нужно изменить URL удаленного репозитория
git remote set-url origin https://github.com/kristina03030609/TrainMy.git

# Или добавить новый remote
git remote add trainmy https://github.com/kristina03030609/TrainMy.git

# Запушить в правильный репозиторий
git push -u origin main
```

### Вариант 2: Пушить текущую ветку style_pin

```bash
# Изменить URL удаленного репозитория на TrainMy
git remote set-url origin https://github.com/kristina03030609/TrainMy.git

# Запушить текущую ветку
git push -u origin style_pin
```

### Вариант 3: Создать новую ветку main и переключиться на неё

```bash
# Создать ветку main из текущей
git checkout -b main

# Изменить URL удаленного репозитория
git remote set-url origin https://github.com/kristina03030609/TrainMy.git

# Запушить новую ветку
git push -u origin main
```

## Рекомендуемый вариант

**Вариант 1** - самый простой и правильный:

1. Переименуйте ветку: `git branch -M main`
2. Измените URL: `git remote set-url origin https://github.com/kristina03030609/TrainMy.git`
3. Запушьте: `git push -u origin main`

