# 📤 Загрузка проекта на GitHub

## Шаг 1: Создайте репозиторий на GitHub

1. Откройте https://github.com/
2. Войдите в свой аккаунт
3. Нажмите **"+"** → **"New repository"**
4. Заполните:
   - **Repository name:** `wordpress-mcp-server`
   - **Description:** `MCP Server for managing WordPress posts via ChatGPT`
   - **Public** или **Private** (по желанию)
   - ❌ **НЕ** добавляйте README, .gitignore, license (они уже есть в проекте)
5. Нажмите **"Create repository"**

## Шаг 2: Инициализируйте Git и загрузите проект

На вашем сервере выполните:

```bash
cd /X

# Инициализация Git
git init

# Добавить все файлы
git add .

# Первый коммит
git commit -m "Initial commit: WordPress MCP Server"

# Добавить remote (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/wordpress-mcp-server.git

# Установить главную ветку
git branch -M main

# Загрузить на GitHub
git push -u origin main
```

## Шаг 3: Введите учетные данные

GitHub попросит ввести:
- **Username:** ваш GitHub username
- **Password:** используйте **Personal Access Token** (не обычный пароль!)

### Как получить Personal Access Token:

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. Выберите **scopes**:
   - ✅ `repo` (Full control of private repositories)
4. **Generate token**
5. **Скопируйте токен** (показывается только один раз!)

## Шаг 4: Проверьте

Откройте: `https://github.com/YOUR_USERNAME/wordpress-mcp-server`

Должны увидеть все файлы проекта! ✅

## 🔄 Обновление проекта

Когда делаете изменения:

```bash
cd /X

# Добавить изменения
git add .

# Коммит с описанием
git commit -m "Update: описание изменений"

# Загрузить на GitHub
git push
```

## 📝 Полезные команды

```bash
# Проверить статус
git status

# Посмотреть историю
git log --oneline

# Посмотреть изменения
git diff

# Отменить изменения в файле
git checkout -- filename

# Создать новую ветку
git checkout -b feature-name

# Переключиться на ветку
git checkout main
```

## 🆘 Если возникли проблемы

### Ошибка: "Support for password authentication was removed"

Используйте **Personal Access Token** вместо пароля!

### Ошибка: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/wordpress-mcp-server.git
```

### Ошибка: "failed to push some refs"

```bash
# Сначала подтяните изменения
git pull origin main --rebase

# Затем загрузите
git push origin main
```

## 🎯 Готово!

Ваш проект теперь на GitHub! 🎉

