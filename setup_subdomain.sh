#!/bin/bash

echo "=========================================="
echo "Настройка поддомена mcp.2msp.online"
echo "=========================================="
echo ""

# Шаг 1: Установка Nginx и Certbot
echo "Шаг 1: Установка Nginx и Certbot..."
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# Шаг 2: Остановка приложений
echo ""
echo "Шаг 2: Остановка приложений..."
pkill -f glass_design_main.py
pkill -f mcp_sse_server.py
sleep 2

# Шаг 3: Изменить порт основного приложения
echo ""
echo "Шаг 3: Изменение порта основного приложения на 8080..."
cd /X/opt/video/

# Создать резервную копию
cp glass_design_main.py glass_design_main.py.backup

# Изменить порт с 443 на 8080 и убрать SSL (его будет обрабатывать Nginx)
sed -i 's/port=443/port=8080/g' glass_design_main.py
sed -i 's/ssl_keyfile=/#ssl_keyfile=/g' glass_design_main.py
sed -i 's/ssl_certfile=/#ssl_certfile=/g' glass_design_main.py

# Шаг 4: Создать конфигурацию Nginx для основного домена
echo ""
echo "Шаг 4: Создание конфигурации Nginx для 2msp.online..."
sudo tee /etc/nginx/sites-available/2msp.online > /dev/null <<'EOF'
server {
    listen 80;
    server_name 2msp.online www.2msp.online;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name 2msp.online www.2msp.online;

    ssl_certificate /etc/letsencrypt/live/2msp.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/2msp.online/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;

    client_max_body_size 25M;

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

# Шаг 5: Создать временную конфигурацию для mcp.2msp.online (для certbot)
echo ""
echo "Шаг 5: Создание временной конфигурации для mcp.2msp.online..."
sudo tee /etc/nginx/sites-available/mcp.2msp.online > /dev/null <<'EOF'
server {
    listen 80;
    server_name mcp.2msp.online;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Шаг 6: Включить конфигурации
echo ""
echo "Шаг 6: Активация конфигураций..."
sudo ln -sf /etc/nginx/sites-available/2msp.online /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/mcp.2msp.online /etc/nginx/sites-enabled/

# Удалить default конфигурацию
sudo rm -f /etc/nginx/sites-enabled/default

# Шаг 7: Проверка конфигурации Nginx
echo ""
echo "Шаг 7: Проверка конфигурации Nginx..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Ошибка в конфигурации Nginx!"
    exit 1
fi

# Шаг 8: Запуск приложений
echo ""
echo "Шаг 8: Запуск приложений..."

# Запустить видео-приложение на порту 8080
cd /X/opt/video/
nohup python3 glass_design_main.py > /X/opt/video/app.log 2>&1 &
echo "Видео-приложение запущено на порту 8080"

# Запустить MCP сервер на порту 8000
cd /X
nohup /X/venv/bin/python /X/mcp_sse_server.py > /X/server.log 2>&1 &
echo "MCP сервер запущен на порту 8000"

sleep 5

# Шаг 9: Запуск Nginx
echo ""
echo "Шаг 9: Запуск Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Шаг 10: Проверка приложений
echo ""
echo "Шаг 10: Проверка приложений..."
echo "Видео-приложение (порт 8080):"
curl -s http://localhost:8080/ | head -5

echo ""
echo "MCP сервер (порт 8000):"
curl -s http://localhost:8000/health

# Шаг 11: Остановить cloudflared (больше не нужен)
echo ""
echo "Шаг 11: Остановка Cloudflare Tunnel..."
pkill cloudflared

echo ""
echo "=========================================="
echo "⚠️  ВАЖНО: Настройка DNS"
echo "=========================================="
echo ""
echo "Перед получением SSL сертификата добавьте DNS запись:"
echo ""
echo "Тип: A"
echo "Имя: mcp"
echo "Значение: $(curl -s ifconfig.me)"
echo "TTL: 300 (или авто)"
echo ""
echo "Проверьте DNS командой:"
echo "  dig mcp.2msp.online +short"
echo ""
echo "После добавления DNS записи нажмите Enter..."
read

# Шаг 12: Получение SSL сертификата для поддомена
echo ""
echo "Шаг 12: Получение SSL сертификата для mcp.2msp.online..."
sudo certbot --nginx -d mcp.2msp.online --non-interactive --agree-tos --email admin@2msp.online --redirect

if [ $? -eq 0 ]; then
    echo "✅ SSL сертификат успешно получен!"
else
    echo "❌ Ошибка получения SSL сертификата"
    echo "Попробуйте вручную: sudo certbot --nginx -d mcp.2msp.online"
fi

# Шаг 13: Перезагрузка Nginx
echo ""
echo "Шаг 13: Перезагрузка Nginx..."
sudo systemctl reload nginx

echo ""
echo "=========================================="
echo "✅ НАСТРОЙКА ЗАВЕРШЕНА!"
echo "=========================================="
echo ""
echo "Ваши приложения:"
echo "  📹 Видео-склейка: https://2msp.online/"
echo "  🔧 MCP сервер:    https://mcp.2msp.online/"
echo "  🤖 Для ChatGPT:   https://mcp.2msp.online/sse"
echo ""
echo "Проверка:"
echo "  curl https://2msp.online/"
echo "  curl https://mcp.2msp.online/health"
echo ""
echo "Управление Nginx:"
echo "  sudo systemctl status nginx"
echo "  sudo systemctl restart nginx"
echo "  sudo nginx -t"
echo ""
echo "Логи:"
echo "  tail -f /var/log/nginx/access.log"
echo "  tail -f /var/log/nginx/error.log"
echo "  tail -f /X/opt/video/app.log"
echo "  tail -f /X/server.log"
echo ""
echo "=========================================="

