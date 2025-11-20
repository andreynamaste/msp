# Архитектура сервера 2msp.online

## Развернутые приложения

### 1. 🎬 Приложение для склейки видео
- **Расположение:** `/X/opt/video/`
- **Главный файл:** `glass_design_main.py`
- **Порт:** 443 (HTTPS)
- **URL:** https://2msp.online/
- **Запуск:** `python3 glass_design_main.py`
- **Управление:**
  ```bash
  # Остановить
  pkill -f glass_design_main.py
  
  # Запустить
  cd /X/opt/video/
  nohup python3 glass_design_main.py > video_app.log 2>&1 &
  
  # Логи
  tail -f /X/opt/video/video_app.log
  ```

### 2. 🔧 WordPress MCP Server
- **Расположение:** `/X/`
- **Главный файл:** `mcp_sse_server.py`
- **Порт:** 8000 (локальный)
- **URL (внешний):** https://agriculture-harry-speeches-sequence.trycloudflare.com/
- **URL (для ChatGPT):** https://agriculture-harry-speeches-sequence.trycloudflare.com/sse
- **Запуск:** `/X/venv/bin/python /X/mcp_sse_server.py`
- **Управление:**
  ```bash
  # Остановить
  pkill -f mcp_sse_server.py
  
  # Запустить
  cd /X
  /X/venv/bin/python /X/mcp_sse_server.py > server.log 2>&1 &
  
  # Логи
  tail -f /X/server.log
  
  # Проверка
  curl http://localhost:8000/health
  ```

### 3. 🌐 Cloudflare Tunnel
- **Назначение:** Проксирование MCP сервера (порт 8000) в интернет
- **PID:** 199524
- **Управление:**
  ```bash
  # Остановить
  pkill cloudflared
  
  # Запустить
  nohup cloudflared tunnel --url http://localhost:8000 > cloudflared.log 2>&1 &
  
  # Получить URL
  sleep 5
  cat cloudflared.log | grep -o 'https://[^ ]*trycloudflare.com'
  
  # Логи
  tail -f cloudflared.log
  ```

## Порты

| Порт | Приложение | Доступ |
|------|-----------|--------|
| 443  | Видео-склейка | Публичный (https://2msp.online/) |
| 8000 | MCP Server | Локальный (через Cloudflare Tunnel) |
| 22   | SSH | Публичный |

## Структура файлов

```
/X/
├── opt/
│   └── video/              # Приложение для склейки видео
│       ├── glass_design_main.py
│       ├── api_keys.json
│       └── ...
├── mcp_sse_server.py       # WordPress MCP Server
├── requirements.txt        # Python зависимости MCP
├── install.sh              # Установочный скрипт MCP
├── README.md               # Документация MCP
├── venv/                   # Виртуальное окружение для MCP
├── server.log              # Логи MCP сервера
└── cloudflared.log         # Логи Cloudflare Tunnel
```

## Рекомендации

### ✅ Что уже правильно:
1. Приложения разделены по директориям
2. Используются разные порты
3. Cloudflare Tunnel для безопасного доступа к MCP
4. Основной сайт на HTTPS с сертификатом

### 💡 Рекомендуется добавить:

1. **Systemd сервисы для автозапуска:**
   ```bash
   # Видео-приложение
   sudo tee /etc/systemd/system/video-app.service > /dev/null <<EOF
   [Unit]
   Description=Video Concatenation App
   After=network.target

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

   sudo systemctl enable video-app
   sudo systemctl start video-app
   ```

   ```bash
   # MCP сервер (уже есть в install.sh)
   sudo systemctl enable wordpress-mcp-server
   sudo systemctl start wordpress-mcp-server
   ```

   ```bash
   # Cloudflare Tunnel
   sudo tee /etc/systemd/system/cloudflare-tunnel.service > /dev/null <<EOF
   [Unit]
   Description=Cloudflare Tunnel for MCP Server
   After=network.target wordpress-mcp-server.service

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/root
   ExecStart=/usr/local/bin/cloudflared tunnel --url http://localhost:8000
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   EOF

   sudo systemctl enable cloudflare-tunnel
   sudo systemctl start cloudflare-tunnel
   ```

2. **Использовать поддомены (опционально):**
   - https://2msp.online/ - видео-склейка
   - https://mcp.2msp.online/ - MCP сервер (вместо Cloudflare Tunnel)

3. **Nginx reverse proxy (опционально):**
   Можно настроить Nginx для проксирования обоих приложений на одном сервере.

## Быстрые команды

### Проверка статуса всех сервисов:
```bash
echo "=== Видео-приложение ==="
ps aux | grep glass_design_main | grep -v grep

echo "=== MCP сервер ==="
ps aux | grep mcp_sse_server | grep -v grep
curl -s http://localhost:8000/health

echo "=== Cloudflare Tunnel ==="
ps aux | grep cloudflared | grep -v grep
cat /X/cloudflared.log | grep -o 'https://[^ ]*trycloudflare.com' | tail -1

echo "=== Порты ==="
netstat -tlnp | grep -E '443|8000|22'
```

### Перезапуск всего:
```bash
# Остановить все
pkill -f glass_design_main.py
pkill -f mcp_sse_server.py
pkill cloudflared

# Запустить все
cd /X/opt/video && nohup python3 glass_design_main.py > video_app.log 2>&1 &
cd /X && /X/venv/bin/python mcp_sse_server.py > server.log 2>&1 &
nohup cloudflared tunnel --url http://localhost:8000 > /X/cloudflared.log 2>&1 &

# Проверить
sleep 5
curl -s https://2msp.online/ | head -20
curl -s http://localhost:8000/health
cat /X/cloudflared.log | grep -o 'https://[^ ]*trycloudflare.com'
```

## Ссылки

- **Видео-склейка:** https://2msp.online/
- **MCP Server (ChatGPT):** https://agriculture-harry-speeches-sequence.trycloudflare.com/sse
- **MCP Health:** https://agriculture-harry-speeches-sequence.trycloudflare.com/health

