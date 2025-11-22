#!/bin/bash
# Script to upload WordPress MCP Server to GitHub
# Repository: https://github.com/andreynamaste/msp

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Загрузка WordPress MCP Server на GitHub                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Сначала получите Personal Access Token:"
echo ""
echo "1. Откройте: https://github.com/settings/tokens"
echo "2. Нажмите: 'Generate new token (classic)'"
echo "3. Название: 'MSP Server Upload'"
echo "4. Срок: 90 days"
echo "5. Permissions: ☑ repo (все галочки)"
echo "6. Нажмите 'Generate token'"
echo "7. СКОПИРУЙТЕ токен!"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

read -p "Вставьте ваш GitHub Personal Access Token: " GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Токен не введен!"
    exit 1
fi

echo ""
echo "🚀 Загружаю проект на GitHub..."
echo ""

# Change to project directory
cd /X

# Configure git to use token
git remote set-url origin https://andreynamaste:${GITHUB_TOKEN}@github.com/andreynamaste/msp.git

# Push to GitHub
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Проект успешно загружен на GitHub!"
    echo ""
    echo "🌐 Репозиторий: https://github.com/andreynamaste/msp"
    echo ""
    
    # Remove token from remote URL for security
    git remote set-url origin https://github.com/andreynamaste/msp.git
    
    echo "✓ Token удален из конфигурации (безопасность)"
    echo ""
else
    echo ""
    echo "❌ Ошибка при загрузке. Проверьте:"
    echo "   - Правильность токена"
    echo "   - Что репозиторий создан на GitHub"
    echo "   - Имя репозитория: msp"
    echo "   - Owner: andreynamaste"
    echo ""
    
    # Remove token from remote URL
    git remote set-url origin https://github.com/andreynamaste/msp.git
fi


