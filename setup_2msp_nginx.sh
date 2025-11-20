#!/bin/bash

set -e

echo "=========================================="
echo "Настройка 2msp.online с MCP на /mcp/"
echo "=========================================="
echo ""

# Шаг 1: Остановить видео-приложение
echo "Шаг 1: Остановка видео-приложения..."
pkill -f glass_design_main.py || true
sleep 2

# Шаг 2: Изменить порт видео-приложения на 8080
echo "Шаг 2: Изменение порта видео-приложения на 8080..."
cd /X/opt/video/

# Создать резервную копию
if [ ! -f glass_design_main.py.backup ]; then
    cp glass_design_main.py glass_design_main.py.backup
    echo "✅ Резервная копия создана"
fi

# Изменить порт с 443 на 8080 и убрать SSL (Nginx будет обрабатывать SSL)
sed -i 's/port=443/port=8080/g' glass_design_main.py
sed -i 's/ssl_keyfile=/#ssl_keyfile=/g' glass_design_main.py
sed -i 's/ssl_certfile=/#ssl_certfile=/g' glass_design_main.py

echo "✅ Порт изменен на 8080"

# Шаг 3: Запустить видео-приложение на новом порту
echo "Шаг 3: Запуск видео-приложения на порту 8080..."
cd /X/opt/video/
nohup python3 glass_design_main.py > /X/opt/video/app.log 2>&1 &
sleep 3

if curl -s http://localhost:8080/ > /dev/null 2>&1; then
    echo "✅ Видео-приложение работает на порту 8080"
else
    echo "⚠️  Видео-приложение может еще запускаться..."
fi

# Шаг 4: Создать конфигурацию Nginx для 2msp.online
echo "Шаг 4: Создание конфигурации Nginx..."

sudo tee /etc/nginx/sites-available/2msp.online > /dev/null <<'EOF'
# Редирект HTTP на HTTPS
server {
    listen 80;
    server_name 2msp.online www.2msp.online;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# Основной сервер HTTPS
server {
    listen 443 ssl http2;
    server_name 2msp.online www.2msp.online;

    # SSL сертификаты (должны быть уже настроены)
    ssl_certificate /etc/letsencrypt/live/2msp.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/2msp.online/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;

    client_max_body_size 25M;

    # MCP сервер - Streamable HTTP endpoint
    location /mcp {
        proxy_pass http://127.0.0.1:8000/mcp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # MCP сервер - SSE endpoint (legacy)
    location /sse {
        proxy_pass http://127.0.0.1:8000/sse;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # SSE specific headers
        proxy_buffering off;
        proxy_cache off;
    }

    # MCP сервер - Health check и info
    location /mcp-health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
    }

    # Видео-приложение - все остальные пути
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# Включаем конфигурацию
sudo ln -sf /etc/nginx/sites-available/2msp.online /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/mcp.2msp.online

# Проверка конфигурации
echo "Проверка конфигурации Nginx..."
if sudo nginx -t; then
    echo "✅ Конфигурация корректна"
else
    echo "❌ Ошибка в конфигурации!"
    exit 1
fi

# Шаг 5: Перезапуск Nginx
echo "Шаг 5: Перезапуск Nginx..."
sudo systemctl restart nginx
sleep 2

if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx перезапущен"
else
    echo "❌ Ошибка перезапуска Nginx!"
    sudo systemctl status nginx
    exit 1
fi

# Шаг 6: Проверка работы
echo ""
echo "Шаг 6: Проверка работы..."
echo ""

echo "Видео-приложение (локально):"
if curl -s http://localhost:8080/ | grep -q "Склейка видео\|Welcome"; then
    echo "✅ Работает"
else
    echo "⚠️  Проверьте вручную"
fi

echo ""
echo "MCP сервер (локально):"
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "✅ Работает"
else
    echo "⚠️  Проверьте вручную"
fi

echo ""
echo "=========================================="
echo "✅ НАСТРОЙКА ЗАВЕРШЕНА!"
echo "=========================================="
echo ""
echo "Ваши URL:"
echo "  📹 Видео-склейка:    https://2msp.online/"
echo "  🔧 MCP сервер:        https://2msp.online/mcp"
echo "  🤖 MCP SSE (legacy):  https://2msp.online/sse"
echo "  ❤️  Health check:     https://2msp.online/mcp-health"
echo ""
echo "Для ChatGPT используйте:"
echo "  https://2msp.online/mcp  (рекомендуется)"
echo "  или"
echo "  https://2msp.online/sse  (legacy)"
echo ""
echo "Проверка:"
echo "  curl https://2msp.online/"
echo "  curl https://2msp.online/mcp-health"
echo ""
echo "=========================================="

