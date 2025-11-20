# WordPress MCP Server

MCP (Model Context Protocol) сервер для управления WordPress постами через ChatGPT.

**Использует официальный Python SDK (FastMCP)** для production deployment.

## 🎯 Что это?

Позволяет ChatGPT создавать, обновлять, получать и удалять посты на вашем WordPress сайте через MCP протокол.

## 🚀 Быстрый старт

### 1. Настройте WordPress credentials

Откройте `mcp_sse_server.py` и измените:

```python
WORDPRESS_URL = "https://your-wordpress-site.com/"
WORDPRESS_USERNAME = "your-username"
WORDPRESS_PASSWORD = "your-password"
```

**Важно:** Используйте Application Password, а не основной пароль!

### 2. Установите зависимости

```bash
cd /X
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Запустите сервер

```bash
/X/venv/bin/python /X/mcp_sse_server.py
```

Сервер запустится на порту 8000.

### 4. Настройте поддомен (для production)

Следуйте инструкции в `/X/SUBDOMAIN_SETUP.md` для настройки `mcp.2msp.online`

### 5. Подключите к ChatGPT

1. Откройте ChatGPT
2. Settings → Connectors → New Connector
3. Укажите:
   - **Name:** WordPress MCP
   - **URL:** `https://mcp.2msp.online/mcp` (Streamable HTTP - рекомендуется)
   - Или: `https://mcp.2msp.online/sse` (SSE - для совместимости)
   - **Authentication:** No authentication
4. Сохраните

### 6. Используйте!

Попросите ChatGPT:
```
Создай пост на моем WordPress сайте про искусственный интеллект на 300 слов
```

## 📊 Архитектура

```
ChatGPT
  ↓ HTTPS
Nginx (SSL) → mcp.2msp.online
  ↓ HTTP
FastAPI + FastMCP Server (port 8000)
  ↓ HTTPS
WordPress REST API
  ↓
WordPress Site
```

## 🔧 Доступные инструменты

1. **create_post** - Создать новый пост
   - Параметры: `title`, `content`, `excerpt` (опционально), `status` (publish/draft/private)

2. **update_post** - Обновить существующий пост
   - Параметры: `post_id` (обязательно), `title`, `content`, `excerpt` (опционально)

3. **get_posts** - Получить список постов
   - Параметры: `per_page` (1-100, по умолчанию 10), `page` (по умолчанию 1)

4. **delete_post** - Удалить пост
   - Параметры: `post_id` (обязательно)

## 🌐 Endpoints

- **GET /** - Информация о сервере
- **GET /health** - Health check
- **GET /sse** - SSE endpoint (legacy, для совместимости)
- **POST /mcp** - Streamable HTTP endpoint (рекомендуется для production)

## 🔒 Безопасность

1. **Application Password**: Используйте специальный Application Password для WordPress
2. **HTTPS**: Работает через Nginx с Let's Encrypt SSL сертификатом
3. **Локальный доступ**: Приложение работает на 127.0.0.1:8000, доступно только через Nginx

## 📝 Создание Application Password в WordPress

1. Войдите в WordPress Admin
2. Users → Your Profile
3. Прокрутите вниз до "Application Passwords"
4. Введите имя (например, "MCP Server")
5. Нажмите "Add New Application Password"
6. Скопируйте сгенерированный пароль (показывается только один раз!)

## 🛠️ Управление

### Проверка статуса

```bash
# Проверить процесс
ps aux | grep mcp_sse_server

# Проверить порт
netstat -tlnp | grep 8000

# Health check
curl http://localhost:8000/health
```

### Просмотр логов

```bash
tail -f /X/server.log
```

### Перезапуск

```bash
# Остановить
pkill -f mcp_sse_server.py

# Запустить
cd /X
/X/venv/bin/python /X/mcp_sse_server.py > server.log 2>&1 &
```

### Автозапуск через systemd

```bash
sudo tee /etc/systemd/system/mcp-server.service > /dev/null <<EOF
[Unit]
Description=WordPress MCP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/X
ExecStart=/X/venv/bin/python /X/mcp_sse_server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable mcp-server
sudo systemctl start mcp-server

# Проверка
sudo systemctl status mcp-server
sudo journalctl -u mcp-server -f
```

## 🔍 Troubleshooting

### Сервер не запускается

```bash
# Проверьте логи
cat /X/server.log

# Проверьте конфигурацию WordPress
grep WORDPRESS /X/mcp_sse_server.py
```

### Ошибки аутентификации WordPress

- Убедитесь, что используете Application Password, а не обычный пароль
- Проверьте, что WordPress REST API включен
- Убедитесь, что URL правильный (с https:// и слэшем в конце)

### ChatGPT не может подключиться

- Проверьте, что сервер работает: `curl https://mcp.2msp.online/health`
- Убедитесь, что используете правильный URL:
  - `https://mcp.2msp.online/mcp` (рекомендуется)
  - Или `https://mcp.2msp.online/sse` (legacy)
- Проверьте SSL сертификат: `curl -I https://mcp.2msp.online/`

### 502 Bad Gateway

```bash
# Проверьте работает ли сервер
ps aux | grep mcp_sse_server

# Проверьте Nginx логи
tail -f /var/log/nginx/error.log

# Перезапустите сервер
pkill -f mcp_sse_server.py
/X/venv/bin/python /X/mcp_sse_server.py > server.log 2>&1 &
```

## 📚 Технические детали

### Используемые технологии

- **FastMCP**: Официальный Python SDK для MCP
- **FastAPI**: ASGI фреймворк для HTTP сервера
- **Streamable HTTP**: Рекомендуемый транспорт для production (MCP спецификация)
- **SSE**: Legacy транспорт для совместимости со старыми клиентами
- **httpx**: Асинхронный HTTP клиент для WordPress REST API

### Транспорты

1. **Streamable HTTP** (`/mcp`) - Рекомендуется для production
   - Более эффективный
   - Лучшая поддержка в новых клиентах
   - Соответствует последней спецификации MCP

2. **SSE** (`/sse`) - Для совместимости
   - Поддерживается старыми клиентами
   - Может быть удален в будущих версиях

## 📄 Лицензия

MIT License

## 🤝 Поддержка

Для вопросов и поддержки создайте issue в репозитории проекта.
