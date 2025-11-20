#!/bin/bash

echo "=========================================="
echo "Подготовка проекта WordPress MCP Server к GitHub"
echo "=========================================="
echo ""

# Шаг 1: Проверка Git
if ! command -v git &> /dev/null; then
    echo "❌ Git не установлен!"
    echo "Установите: sudo apt install git"
    exit 1
fi

echo "✅ Git установлен: $(git --version)"
echo ""

# Шаг 2: Настройка Git (если не настроен)
if [ -z "$(git config --global user.name)" ]; then
    echo "Настройка Git..."
    read -p "Введите ваше имя для Git: " git_name
    git config --global user.name "$git_name"
fi

if [ -z "$(git config --global user.email)" ]; then
    read -p "Введите ваш email для Git: " git_email
    git config --global user.email "$git_email"
fi

echo "✅ Git настроен:"
echo "  Имя: $(git config --global user.name)"
echo "  Email: $(git config --global user.email)"
echo ""

# Шаг 3: Создание .gitignore
echo "Создание .gitignore..."
if [ -f /X/.gitignore ]; then
    echo "✅ .gitignore уже существует"
else
    echo "⚠️  .gitignore не найден!"
fi

# Шаг 4: Переименование README
echo ""
echo "Подготовка README для GitHub..."
if [ -f /X/README_GITHUB.md ]; then
    cp /X/README.md /X/README_OLD.md 2>/dev/null
    cp /X/README_GITHUB.md /X/README.md
    echo "✅ README обновлен"
fi

# Шаг 5: Инициализация репозитория
echo ""
echo "Инициализация Git репозитория..."
cd /X

if [ -d .git ]; then
    echo "⚠️  Git репозиторий уже инициализирован"
else
    git init
    echo "✅ Git репозиторий создан"
fi

# Шаг 6: Добавление файлов
echo ""
echo "Добавление файлов в Git..."
git add .gitignore
git add README.md
git add requirements.txt
git add mcp_sse_server.py
git add CHATGPT_SETUP.md
git add GITHUB_UPLOAD.md
git add setup_2msp_nginx.sh
git add MCP_SETUP_GUIDE.md 2>/dev/null
git add FINAL_SETUP.md 2>/dev/null
git add QUICK_START_MCP.md 2>/dev/null

echo "✅ Файлы добавлены"

# Шаг 7: Проверка статуса
echo ""
echo "Статус Git:"
git status --short

# Шаг 8: Первый коммит
echo ""
read -p "Создать коммит? (y/n): " do_commit
if [ "$do_commit" = "y" ]; then
    git commit -m "Initial commit: WordPress MCP Server for ChatGPT"
    echo "✅ Коммит создан"
fi

echo ""
echo "=========================================="
echo "✅ ПОДГОТОВКА ЗАВЕРШЕНА!"
echo "=========================================="
echo ""
echo "Следующие шаги:"
echo ""
echo "1. Создайте репозиторий на GitHub:"
echo "   https://github.com/new"
echo "   Название: wordpress-mcp-server"
echo ""
echo "2. Добавьте remote и загрузите:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/wordpress-mcp-server.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. GitHub попросит ввести:"
echo "   Username: ваш GitHub username"
echo "   Password: Personal Access Token (не обычный пароль!)"
echo ""
echo "Как получить Personal Access Token:"
echo "   GitHub → Settings → Developer settings → Personal access tokens"
echo "   → Tokens (classic) → Generate new token"
echo "   Выберите scope: repo (Full control)"
echo ""
echo "Подробная инструкция: cat /X/GITHUB_UPLOAD.md"
echo "=========================================="

