# 🚀 Полная инструкция по настройке MCP сервера на mcp.2msp.online

## 📋 Обзор

Этот гайд поможет вам настроить WordPress MCP Server на поддомене `mcp.2msp.online` с использованием официального Python SDK (FastMCP).

## ✅ Что вы получите

- ✅ MCP сервер на `https://mcp.2msp.online/`
- ✅ SSL сертификат Let's Encrypt (бесплатный)
- ✅ Поддержка Streamable HTTP (рекомендуется) и SSE (legacy)
- ✅ Интеграция с ChatGPT
- ✅ Автозапуск через systemd

## 🔧 Шаг 1: Настройка WordPress credentials

### 1.1 Откройте файл конфигурации

```bash
nano /X/mcp_sse_server.py
```

### 1.2 Найдите и измените настройки (строки 31-33):

```python
WORDPRESS_URL = "https://your-wordpress-site.com/"
WORDPRESS_USERNAME = "your-username"
WORDPRESS_PASSWORD = "your-password"
```

### 1.3 Создайте Application Password в WordPress

1. Войдите в WordPress Admin панель
2. Перейдите: **Users** → **Your Profile**
3. Прокрутите до раздела **Application Passwords**
4. Введите имя: `MCP Server`
5. Нажмите **Add New Application Password**
6. **ВАЖНО:** Скопируйте пароль сразу! Он показывается только один раз.

### 1.4 Обновите конфигурацию

```python
WORDPRESS_URL = "https://your-actual-wordpress-site.com/"
WORDPRESS_USERNAME = "your-wordpress-username"
WORDPRESS_PASSWORD = "xxxx xxxx xxxx xxxx xxxx xxxx"  # Application Password
```

## 🌐 Шаг 2: Настройка DNS

### 2.1 Узнайте IP адрес сервера

```bash
curl ifconfig.me
```

Запишите IP (например: `83.222.23.216`)

### 2.2 Добавьте DNS запись

Зайдите в панель управления доменом **2msp.online** и добавьте:

**A-запись:**
```
Тип:     A
Имя:     mcp
Значение: [ваш IP адрес]
TTL:     300 (или Auto)
```

**Где добавить:**
- **Cloudflare**: DNS → Add record
- **Reg.ru**: Управление DNS → Добавить запись
- **Namecheap**: Advanced DNS → Add New Record

### 2.3 Проверьте DNS (подождите 1-5 минут)

```bash
dig mcp.2msp.online +short
```

Должен вернуть ваш IP адрес ✅

Или проверьте онлайн: https://dnschecker.org/#A/mcp.2msp.online

## 🔧 Шаг 3: Установка и настройка

### 3.1 Установите зависимости

```bash
cd /X

# Создайте виртуальное окружение (если еще не создано)
python3 -m venv venv
source venv/bin/activate

# Установите пакеты
pip install --upgrade pip
pip install -r requirements.txt
```

### 3.2 Установите Nginx и Certbot

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 3.3 Создайте конфигурацию Nginx

```bash
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF
```

### 3.4 Включите конфигурацию

```bash
sudo ln -sf /etc/nginx/sites-available/mcp.2msp.online /etc/nginx/sites-enabled/
sudo nginx -t
```

Если тест прошел успешно, перезапустите Nginx:

```bash
sudo systemctl restart nginx
```

### 3.5 Запустите MCP сервер

```bash
cd /X
/X/venv/bin/python /X/mcp_sse_server.py > server.log 2>&1 &
```

Проверьте работу:

```bash
curl http://localhost:8000/health
```

Должен вернуть: `{"status":"healthy","service":"wordpress-mcp-server"}`

### 3.6 Получите SSL сертификат

```bash
sudo certbot --nginx -d mcp.2msp.online --non-interactive --agree-tos --email admin@2msp.online --redirect
```

Certbot автоматически:
- Получит SSL сертификат
- Обновит конфигурацию Nginx
- Настроит редирект с HTTP на HTTPS

### 3.7 Проверьте работу

```bash
# Health check
curl https://mcp.2msp.online/health

# Информация о сервере
curl https://mcp.2msp.online/

# Должен вернуть JSON с информацией о сервере
```

## 🤖 Шаг 4: Подключение к ChatGPT

### 4.1 Откройте ChatGPT

1. Войдите в ChatGPT
2. Перейдите в **Settings** → **Connectors**
3. Нажмите **New Connector**

### 4.2 Настройте подключение

Заполните форму:

- **Name:** `WordPress MCP`
- **URL:** `https://mcp.2msp.online/mcp` (рекомендуется)
  - Или: `https://mcp.2msp.online/sse` (для совместимости)
- **Authentication:** `No authentication`
- **Description:** (опционально) `WordPress MCP Server for managing posts`

### 4.3 Сохраните

Нажмите **Save** или **Connect**

### 4.4 Проверьте подключение

Попросите ChatGPT:
```
Покажи список доступных инструментов для WordPress
```

Или:
```
Создай тестовый пост на моем WordPress сайте с заголовком "Тест MCP" и содержимым "Это тестовый пост"
```

## 🔄 Шаг 5: Настройка автозапуска

### 5.1 Создайте systemd сервис

```bash
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
```

### 5.2 Включите и запустите сервис

```bash
sudo systemctl daemon-reload
sudo systemctl enable mcp-server
sudo systemctl start mcp-server
```

### 5.3 Проверьте статус

```bash
sudo systemctl status mcp-server
```

### 5.4 Просмотр логов

```bash
# Логи systemd
sudo journalctl -u mcp-server -f

# Или файл логов
tail -f /X/server.log
```

## ✅ Проверка работы

### Тест 1: Health check

```bash
curl https://mcp.2msp.online/health
```

Ожидаемый результат:
```json
{
  "status": "healthy",
  "service": "wordpress-mcp-server",
  "wordpress_configured": true
}
```

### Тест 2: Информация о сервере

```bash
curl https://mcp.2msp.online/
```

Должен вернуть JSON с информацией о сервере и доступных инструментах.

### Тест 3: Через ChatGPT

Попросите ChatGPT:
```
Создай пост на моем WordPress сайте про искусственный интеллект на 200 слов
```

## 🛠️ Управление

### Остановить сервер

```bash
sudo systemctl stop mcp-server
```

### Запустить сервер

```bash
sudo systemctl start mcp-server
```

### Перезапустить сервер

```bash
sudo systemctl restart mcp-server
```

### Просмотр логов

```bash
# Последние 50 строк
sudo journalctl -u mcp-server -n 50

# Следить за логами в реальном времени
sudo journalctl -u mcp-server -f
```

### Обновить конфигурацию WordPress

1. Отредактируйте `/X/mcp_sse_server.py`
2. Измените `WORDPRESS_URL`, `WORDPRESS_USERNAME`, `WORDPRESS_PASSWORD`
3. Перезапустите сервис: `sudo systemctl restart mcp-server`

## 🔍 Troubleshooting

### Проблема: DNS не резолвится

**Решение:**
```bash
# Проверьте DNS
dig mcp.2msp.online +short

# Если пусто - подождите 5-10 минут
# DNS записи обновляются не мгновенно
```

### Проблема: 502 Bad Gateway

**Решение:**
```bash
# Проверьте работает ли сервер
ps aux | grep mcp_sse_server

# Проверьте порт
netstat -tlnp | grep 8000

# Перезапустите сервер
sudo systemctl restart mcp-server

# Проверьте логи Nginx
tail -f /var/log/nginx/error.log
```

### Проблема: Ошибка SSL сертификата

**Решение:**
```bash
# Получите сертификат вручную
sudo certbot --nginx -d mcp.2msp.online

# Проверьте сертификаты
sudo certbot certificates

# Обновите сертификат
sudo certbot renew
```

### Проблема: ChatGPT не может подключиться

**Решение:**
1. Проверьте URL: `https://mcp.2msp.online/mcp` или `https://mcp.2msp.online/sse`
2. Проверьте SSL: `curl -I https://mcp.2msp.online/`
3. Проверьте health: `curl https://mcp.2msp.online/health`
4. Проверьте логи: `sudo journalctl -u mcp-server -n 50`

### Проблема: Ошибки WordPress API

**Решение:**
1. Проверьте Application Password (не обычный пароль!)
2. Проверьте URL WordPress (должен быть с https:// и слэшем в конце)
3. Проверьте что WordPress REST API включен
4. Проверьте логи: `sudo journalctl -u mcp-server -f`

## 📊 Структура после настройки

```
https://mcp.2msp.online/
  ↓ HTTPS (SSL)
Nginx (порт 443)
  ↓ HTTP
FastAPI + FastMCP (порт 8000)
  ↓ HTTPS
WordPress REST API
  ↓
WordPress Site
```

## 🎉 Готово!

Ваш MCP сервер настроен и готов к работе!

**URL для ChatGPT:**
- Streamable HTTP: `https://mcp.2msp.online/mcp` (рекомендуется)
- SSE: `https://mcp.2msp.online/sse` (legacy)

**Управление:**
```bash
sudo systemctl status mcp-server
sudo systemctl restart mcp-server
sudo journalctl -u mcp-server -f
```

