# Настройка поддомена mcp.2msp.online для MCP сервера

## 🎯 Цель

Разместить MCP сервер на поддомене **mcp.2msp.online**, сохранив основное приложение на **2msp.online**

## 📊 Текущая структура → Новая структура

### Было:
- ❌ https://2msp.online/ → uvicorn:443 (с SSL)
- ❌ MCP сервер → localhost:8000 (через Cloudflare Tunnel)

### Будет:
- ✅ https://2msp.online/ → Nginx:443 → uvicorn:8080 (видео-склейка)
- ✅ https://mcp.2msp.online/ → Nginx:443 → uvicorn:8000 (MCP сервер)

## 🚀 Быстрая установка

### Шаг 1: Получите IP адрес сервера

```bash
curl ifconfig.me
```

Запишите этот IP (например: `123.45.67.89`)

### Шаг 2: Добавьте DNS запись

Зайдите в панель управления вашего DNS провайдера (где зарегистрирован домен 2msp.online) и добавьте:

**A-запись:**
```
Тип:     A
Имя:     mcp
Значение: [IP адрес из шага 1]
TTL:     300 (или Auto)
```

**Пример для разных провайдеров:**

#### Cloudflare:
1. Dashboard → выберите домен 2msp.online
2. DNS → Add record
3. Type: A
4. Name: mcp
5. IPv4 address: ваш IP
6. Proxy status: DNS only (серая иконка)
7. Save

#### Reg.ru:
1. Мои домены → 2msp.online → Управление DNS
2. Добавить запись
3. Тип: A
4. Субдомен: mcp
5. IP-адрес: ваш IP
6. Сохранить

#### Namecheap:
1. Domain List → Manage → Advanced DNS
2. Add New Record
3. Type: A Record
4. Host: mcp
5. Value: ваш IP
6. TTL: Automatic
7. Save

### Шаг 3: Проверьте DNS

Подождите 1-5 минут и проверьте:

```bash
dig mcp.2msp.online +short
# Должен вернуть ваш IP адрес
```

Или через браузер: https://dnschecker.org/ (введите `mcp.2msp.online`)

### Шаг 4: Запустите скрипт установки

```bash
chmod +x /X/setup_subdomain.sh
sudo /X/setup_subdomain.sh
```

Скрипт автоматически:
1. ✅ Установит Nginx и Certbot
2. ✅ Изменит порт видео-приложения (443 → 8080)
3. ✅ Настроит Nginx reverse proxy
4. ✅ Получит SSL сертификат для mcp.2msp.online
5. ✅ Перезапустит все приложения

### Шаг 5: Проверьте работу

```bash
# Основной сайт
curl -I https://2msp.online/

# MCP сервер
curl https://mcp.2msp.online/health

# Должен вернуть:
# {"status":"healthy","service":"wordpress-mcp-sse-server"}
```

## 🎉 Готово!

### Ваши ссылки:

**Для пользователей:**
- 📹 Видео-склейка: https://2msp.online/

**Для ChatGPT:**
- 🤖 MCP сервер: https://mcp.2msp.online/sse

### Подключение к ChatGPT:

1. Откройте ChatGPT
2. Settings → Connectors → New Connector
3. Заполните:
   - **Name:** WordPress MCP
   - **URL:** `https://mcp.2msp.online/sse`
   - **Authentication:** No authentication
4. Save

### Использование:

Просто попросите ChatGPT:
```
Создай пост на моем WordPress сайте про искусственный интеллект
```

## 🔧 Управление

### Проверка статуса:

```bash
# Nginx
sudo systemctl status nginx

# Проверка портов
netstat -tlnp | grep -E ':443|:8080|:8000'

# Логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
tail -f /X/opt/video/app.log
tail -f /X/server.log
```

### Перезапуск приложений:

```bash
# Видео-приложение
pkill -f glass_design_main.py
cd /X/opt/video/
nohup python3 glass_design_main.py > app.log 2>&1 &

# MCP сервер
pkill -f mcp_sse_server.py
cd /X
nohup /X/venv/bin/python mcp_sse_server.py > server.log 2>&1 &

# Nginx
sudo systemctl restart nginx
```

### Автозапуск при перезагрузке:

```bash
# Создать systemd сервис для видео-приложения
sudo tee /etc/systemd/system/video-app.service > /dev/null <<EOF
[Unit]
Description=Video Concatenation App
After=network.target nginx.service

[Service]
Type=simple
User=root
WorkingDirectory=/X/opt/video
ExecStart=/usr/bin/python3 glass_design_main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Создать systemd сервис для MCP сервера
sudo tee /etc/systemd/system/mcp-server.service > /dev/null <<EOF
[Unit]
Description=WordPress MCP Server
After=network.target nginx.service

[Service]
Type=simple
User=root
WorkingDirectory=/X
ExecStart=/X/venv/bin/python /X/mcp_sse_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Включить автозапуск
sudo systemctl enable video-app
sudo systemctl enable mcp-server
sudo systemctl enable nginx

# Запустить
sudo systemctl start video-app
sudo systemctl start mcp-server
```

## 🔍 Troubleshooting

### Проблема: DNS не резолвится

```bash
# Проверьте DNS
dig mcp.2msp.online +short

# Если пусто - подождите 5-10 минут
# DNS записи обновляются не мгновенно
```

### Проблема: Ошибка SSL сертификата

```bash
# Попробуйте получить сертификат вручную
sudo certbot --nginx -d mcp.2msp.online

# Проверьте сертификаты
sudo certbot certificates
```

### Проблема: 502 Bad Gateway

```bash
# Проверьте работают ли приложения
ps aux | grep -E 'glass_design_main|mcp_sse_server'

# Проверьте порты
netstat -tlnp | grep -E ':8080|:8000'

# Перезапустите приложения (см. команды выше)
```

### Проблема: Порт 443 занят

```bash
# Проверьте что занимает порт
sudo lsof -i :443

# Если старое приложение - остановите его
pkill -f glass_design_main.py
```

## 📝 Откат изменений

Если что-то пошло не так:

```bash
# Остановить Nginx
sudo systemctl stop nginx

# Восстановить старую версию приложения
cd /X/opt/video/
cp glass_design_main.py.backup glass_design_main.py

# Запустить приложение на порту 443
pkill -f glass_design_main.py
python3 glass_design_main.py &

# Запустить Cloudflare Tunnel для MCP
pkill cloudflared
nohup cloudflared tunnel --url http://localhost:8000 > /X/cloudflared.log 2>&1 &
sleep 5
cat /X/cloudflared.log | grep -o 'https://[^ ]*trycloudflare.com'
```

## 📊 Структура после настройки

```
┌─────────────────┐
│   Интернет      │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Nginx   │ (порт 443 HTTPS)
    └────┬────┘
         │
    ┌────┴──────────────────────┐
    │                           │
┌───▼────────────┐    ┌────────▼────────┐
│ 2msp.online    │    │ mcp.2msp.online │
│ → :8080        │    │ → :8000         │
└───┬────────────┘    └────────┬────────┘
    │                          │
┌───▼─────────────┐   ┌────────▼────────────┐
│ Видео-склейка   │   │ WordPress MCP       │
│ (uvicorn:8080)  │   │ (uvicorn:8000)      │
└─────────────────┘   └─────────────────────┘
```

## 🔒 Безопасность

После настройки:
- ✅ Оба сайта работают по HTTPS с Let's Encrypt сертификатами
- ✅ Автоматическое обновление сертификатов (certbot renew)
- ✅ Nginx обрабатывает SSL/TLS
- ✅ Приложения работают локально (127.0.0.1)
- ✅ Нет прямого доступа к внутренним портам

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `tail -f /var/log/nginx/error.log`
2. Проверьте конфигурацию: `sudo nginx -t`
3. Проверьте DNS: `dig mcp.2msp.online +short`
4. Проверьте приложения: `ps aux | grep python3`

