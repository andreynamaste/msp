# WordPress MCP Server

MCP (Model Context Protocol) сервер для управления WordPress постами через ChatGPT.

## 🎯 Описание

Позволяет ChatGPT создавать, обновлять, получать и удалять посты на вашем WordPress сайте через MCP протокол.

## ⚡ Возможности

- ✅ Создание WordPress постов через ChatGPT
- ✅ Обновление существующих постов
- ✅ Получение списка постов
- ✅ Удаление постов
- ✅ Работа по HTTPS с SSL сертификатом
- ✅ Поддержка SSE и Streamable HTTP транспортов
- ✅ Автозапуск через systemd

## 🏗️ Архитектура

```
ChatGPT
  ↓ HTTPS
2msp.online/sse
  ↓ Nginx (SSL)
  ↓ FastAPI + FastMCP (порт 8000)
  ↓ HTTPS
WordPress REST API
  ↓
WordPress Site
```

## 📦 Технологии

- **FastMCP** - Официальный Python SDK для MCP
- **FastAPI** - ASGI фреймворк для HTTP сервера
- **Uvicorn** - ASGI сервер
- **httpx** - Async HTTP клиент для WordPress REST API
- **Nginx** - Reverse proxy с SSL
- **Let's Encrypt** - Бесплатный SSL сертификат

## 🚀 Быстрый старт

### 1. Установите зависимости

```bash
cd /X
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Настройте WordPress credentials

Откройте `mcp_sse_server.py` и измените:

```python
WORDPRESS_URL = "https://your-wordpress-site.com/"
WORDPRESS_USERNAME = "your-username"
WORDPRESS_PASSWORD = "your-application-password"
```

### 3. Запустите сервер

```bash
python mcp_sse_server.py
```

### 4. Настройте Nginx и SSL

Следуйте инструкциям в `SETUP_GUIDE.md`

### 5. Подключите к ChatGPT

1. ChatGPT → Settings → Connectors → New Connector
2. URL: `https://your-domain.com/sse`
3. Authentication: No authentication

## 📁 Структура проекта

```
wordpress-mcp-server/
├── mcp_sse_server.py       # Главный файл сервера
├── requirements.txt         # Python зависимости
├── README.md               # Документация
├── CHATGPT_SETUP.md        # Инструкция по подключению к ChatGPT
├── setup_2msp_nginx.sh     # Скрипт настройки Nginx
└── .gitignore              # Git ignore файл
```

## 🔧 Доступные инструменты

1. **create_post** - Создать новый пост
2. **update_post** - Обновить существующий пост
3. **get_posts** - Получить список постов
4. **delete_post** - Удалить пост

## 📖 Документация

- `CHATGPT_SETUP.md` - Подключение к ChatGPT
- `FINAL_SETUP.md` - Финальная конфигурация
- `MCP_SETUP_GUIDE.md` - Полная инструкция по установке

## 🔒 Безопасность

- Используйте Application Password для WordPress
- Работает через HTTPS с Let's Encrypt SSL
- Nginx обрабатывает SSL/TLS
- Приложение работает локально (127.0.0.1)

## 📝 Лицензия

MIT License

## 🤝 Автор

Проект создан для интеграции ChatGPT с WordPress через MCP протокол.

## 🆘 Поддержка

Если возникли проблемы, см. `CHATGPT_SETUP.md` раздел Troubleshooting.

