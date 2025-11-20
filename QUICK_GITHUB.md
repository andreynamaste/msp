# ⚡ Быстрая загрузка на GitHub

## 🎯 За 3 минуты

### 1️⃣ Создайте репозиторий на GitHub

Откройте: https://github.com/new

Заполните:
- **Name:** `wordpress-mcp-server`
- **Description:** `MCP Server for WordPress and ChatGPT`
- **Public** ✅
- **❌ НЕ добавляйте** README, .gitignore, license

Нажмите **Create repository**

---

### 2️⃣ Получите Personal Access Token

1. GitHub → **Settings** (ваш профиль) → **Developer settings**
2. **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)**
4. **Note:** `MCP Server Upload`
5. **Expiration:** `90 days` (или по желанию)
6. **Scopes:** ✅ `repo` (Full control of private repositories)
7. **Generate token**
8. **📋 СКОПИРУЙТЕ ТОКЕН!** (показывается только один раз)

---

### 3️⃣ Загрузите проект

На вашем сервере:

```bash
cd /X

# Запустите скрипт подготовки
./prepare_for_github.sh

# Добавьте remote (замените YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/wordpress-mcp-server.git

# Установите главную ветку
git branch -M main

# Загрузите (используйте токен как пароль!)
git push -u origin main
```

Когда попросит:
- **Username:** ваш GitHub username
- **Password:** вставьте **Personal Access Token** (не обычный пароль!)

---

## ✅ Готово!

Откройте: `https://github.com/YOUR_USERNAME/wordpress-mcp-server`

---

## 🔄 Обновление проекта

После изменений:

```bash
cd /X
git add .
git commit -m "Update: описание изменений"
git push
```

---

## 🆘 Проблемы?

### "Support for password authentication was removed"
→ Используйте **Personal Access Token**, не обычный пароль!

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/wordpress-mcp-server.git
```

### Забыли Token?
Создайте новый на https://github.com/settings/tokens

