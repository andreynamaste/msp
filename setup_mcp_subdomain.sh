#!/bin/bash

set -e

echo "=========================================="
echo "Настройка mcp.2msp.online - ПОЛНАЯ УСТАНОВКА"
echo "=========================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Шаг 1: Получить IP адрес
echo -e "${GREEN}Шаг 1: Получение IP адреса сервера...${NC}"
SERVER_IP=$(curl -s ifconfig.me)
echo "IP адрес сервера: $SERVER_IP"
echo ""

# Шаг 2: Проверка DNS
echo -e "${YELLOW}Шаг 2: Проверка DNS записи...${NC}"
DNS_RESULT=$(dig mcp.2msp.online +short 2>/dev/null || echo "")

if [ -z "$DNS_RESULT" ]; then
    echo -e "${RED}❌ DNS запись не найдена!${NC}"
    echo ""
    echo "Вам нужно добавить DNS запись:"
    echo "  Тип: A"
    echo "  Имя: mcp"
    echo "  IP: $SERVER_IP"
    echo "  TTL: 300 (или Auto)"
    echo ""
    echo "Где добавить:"
    echo "  - Cloudflare: DNS → Add record"
    echo "  - Reg.ru: Управление DNS → Добавить запись"
    echo "  - Namecheap: Advanced DNS → Add New Record"
    echo ""
    read -p "Нажмите Enter после добавления DNS записи..."
    
    # Проверка еще раз
    echo "Проверяю DNS еще раз..."
    sleep 5
    DNS_RESULT=$(dig mcp.2msp.online +short 2>/dev/null || echo "")
    if [ -z "$DNS_RESULT" ]; then
        echo -e "${YELLOW}⚠️  DNS еще не обновился. Продолжаю установку...${NC}"
        echo "Вы можете получить SSL сертификат позже, когда DNS обновится."
    else
        echo -e "${GREEN}✅ DNS найден: $DNS_RESULT${NC}"
    fi
else
    echo -e "${GREEN}✅ DNS найден: $DNS_RESULT${NC}"
fi
echo ""

# Шаг 3: Установка Nginx
echo -e "${GREEN}Шаг 3: Установка Nginx и Certbot...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt update
    sudo apt install -y nginx certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Nginx установлен${NC}"
else
    echo -e "${GREEN}✅ Nginx уже установлен${NC}"
fi
echo ""

# Шаг 4: Создание конфигурации Nginx
echo -e "${GREEN}Шаг 4: Создание конфигурации Nginx...${NC}"

# Создаем директории если их нет
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Создаем конфигурацию для HTTP (до получения SSL)
sudo tee /etc/nginx/sites-available/mcp.2msp.online > /dev/null <<'EOF'
server {
    listen 80;
    server_name mcp.2msp.online;

    client_max_body_size 25M;

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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# Включаем конфигурацию
sudo ln -sf /etc/nginx/sites-available/mcp.2msp.online /etc/nginx/sites-enabled/

# Удаляем default если есть
sudo rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации
echo "Проверка конфигурации Nginx..."
if sudo nginx -t; then
    echo -e "${GREEN}✅ Конфигурация Nginx корректна${NC}"
else
    echo -e "${RED}❌ Ошибка в конфигурации Nginx!${NC}"
    exit 1
fi
echo ""

# Шаг 5: Запуск/перезапуск Nginx
echo -e "${GREEN}Шаг 5: Запуск Nginx...${NC}"
sudo systemctl enable nginx
sudo systemctl restart nginx
sleep 2

if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx запущен${NC}"
else
    echo -e "${RED}❌ Ошибка запуска Nginx!${NC}"
    sudo systemctl status nginx
    exit 1
fi
echo ""

# Шаг 6: Проверка MCP сервера
echo -e "${GREEN}Шаг 6: Проверка MCP сервера...${NC}"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MCP сервер работает${NC}"
else
    echo -e "${YELLOW}⚠️  MCP сервер не отвечает, запускаю...${NC}"
    cd /X
    pkill -f mcp_sse_server.py 2>/dev/null || true
    sleep 1
    /X/venv/bin/python /X/mcp_sse_server.py > /X/server.log 2>&1 &
    sleep 3
    
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MCP сервер запущен${NC}"
    else
        echo -e "${RED}❌ Не удалось запустить MCP сервер${NC}"
        echo "Проверьте логи: tail -f /X/server.log"
    fi
fi
echo ""

# Шаг 7: Получение SSL сертификата
echo -e "${GREEN}Шаг 7: Получение SSL сертификата...${NC}"

# Проверяем DNS еще раз
DNS_RESULT=$(dig mcp.2msp.online +short 2>/dev/null || echo "")

if [ -z "$DNS_RESULT" ]; then
    echo -e "${YELLOW}⚠️  DNS запись еще не обновилась${NC}"
    echo "SSL сертификат можно получить позже командой:"
    echo "  sudo certbot --nginx -d mcp.2msp.online"
    echo ""
else
    echo "DNS найден: $DNS_RESULT"
    echo "Получаю SSL сертификат..."
    
    # Получаем сертификат
    if sudo certbot --nginx -d mcp.2msp.online --non-interactive --agree-tos --email admin@2msp.online --redirect 2>&1 | tee /tmp/certbot.log; then
        echo -e "${GREEN}✅ SSL сертификат получен!${NC}"
    else
        echo -e "${YELLOW}⚠️  Не удалось получить SSL сертификат автоматически${NC}"
        echo "Возможные причины:"
        echo "  - DNS еще не обновился полностью"
        echo "  - Порт 80 заблокирован"
        echo ""
        echo "Попробуйте позже:"
        echo "  sudo certbot --nginx -d mcp.2msp.online"
    fi
fi
echo ""

# Шаг 8: Создание systemd сервиса
echo -e "${GREEN}Шаг 8: Создание systemd сервиса для автозапуска...${NC}"
sudo tee /etc/systemd/system/mcp-server.service > /dev/null <<EOF
[Unit]
Description=WordPress MCP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/X
Environment=PATH=/X/venv/bin
ExecStart=/X/venv/bin/python /X/mcp_sse_server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable mcp-server

if sudo systemctl is-active --quiet mcp-server; then
    sudo systemctl restart mcp-server
else
    sudo systemctl start mcp-server
fi

sleep 2

if sudo systemctl is-active --quiet mcp-server; then
    echo -e "${GREEN}✅ Systemd сервис создан и запущен${NC}"
else
    echo -e "${YELLOW}⚠️  Systemd сервис создан, но не запущен${NC}"
    echo "Проверьте: sudo systemctl status mcp-server"
fi
echo ""

# Шаг 9: Финальная проверка
echo -e "${GREEN}Шаг 9: Финальная проверка...${NC}"
echo ""

echo "Проверка локального сервера:"
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo -e "${GREEN}✅ MCP сервер работает локально${NC}"
else
    echo -e "${RED}❌ MCP сервер не отвечает${NC}"
fi

echo ""
echo "Проверка через Nginx (HTTP):"
if curl -s http://localhost/health -H "Host: mcp.2msp.online" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Nginx проксирует запросы${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx не проксирует (возможно нужно подождать)${NC}"
fi

echo ""
echo "Проверка DNS:"
DNS_RESULT=$(dig mcp.2msp.online +short 2>/dev/null || echo "")
if [ -n "$DNS_RESULT" ]; then
    echo -e "${GREEN}✅ DNS: $DNS_RESULT${NC}"
    
    echo ""
    echo "Проверка внешнего доступа (может занять время):"
    if curl -s --max-time 5 http://mcp.2msp.online/health 2>/dev/null | grep -q "healthy"; then
        echo -e "${GREEN}✅ Сайт доступен из интернета!${NC}"
    else
        echo -e "${YELLOW}⚠️  Сайт пока недоступен из интернета${NC}"
        echo "Подождите 5-10 минут для распространения DNS"
    fi
else
    echo -e "${RED}❌ DNS запись не найдена${NC}"
    echo "Добавьте DNS запись:"
    echo "  Тип: A, Имя: mcp, IP: $SERVER_IP"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ УСТАНОВКА ЗАВЕРШЕНА!${NC}"
echo "=========================================="
echo ""
echo "Ваши URL:"
echo "  Локально: http://localhost:8000/health"
echo "  Через Nginx: http://mcp.2msp.online/health (если DNS настроен)"
echo ""
echo "Для ChatGPT используйте:"
if [ -n "$DNS_RESULT" ]; then
    echo -e "${GREEN}  https://mcp.2msp.online/mcp${NC} (после получения SSL)"
    echo -e "${GREEN}  https://mcp.2msp.online/sse${NC} (SSE, после получения SSL)"
else
    echo -e "${YELLOW}  https://mcp.2msp.online/mcp${NC} (после настройки DNS и SSL)"
fi
echo ""
echo "Управление:"
echo "  sudo systemctl status mcp-server"
echo "  sudo systemctl restart mcp-server"
echo "  sudo journalctl -u mcp-server -f"
echo ""
echo "Если DNS не настроен, добавьте запись и затем:"
echo "  sudo certbot --nginx -d mcp.2msp.online"
echo ""
echo "=========================================="

