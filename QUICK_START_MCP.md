# ⚡ Быстрый старт: MCP сервер на mcp.2msp.online

## 🎯 За 10 минут

### 1️⃣ Настройте WordPress (2 мин)

```bash
nano /X/mcp_sse_server.py
```

Измените строки 31-33:
```python
WORDPRESS_URL = "https://ваш-wordpress-сайт.com/"
WORDPRESS_USERNAME = "ваш-логин"
WORDPRESS_PASSWORD = "xxxx xxxx xxxx xxxx"  # Application Password
```

**Как получить Application Password:**
1. WordPress Admin → Users → Your Profile
2. Application Passwords → Add New
3. Скопируйте пароль (показывается один раз!)

---

### 2️⃣ Добавьте DNS (2 мин)

**Ваш IP:** `83.222.23.216`

В панели домена **2msp.online** добавьте:
```
Тип: A
Имя: mcp
IP: 83.222.23.216
```

**Проверка (через 1-2 мин):**
```bash
dig mcp.2msp.online +short
```

---

### 3️⃣ Установите и запустите (5 мин)

```bash
# Установите Nginx и Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Создайте конфигурацию Nginx
sudo tee /etc/nginx/sites-available/mcp.2msp.online > /dev/null <<'EOF'
server {
    listen 80;
    server_name mcp.2msp.online;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Включите конфигурацию
sudo ln -sf /etc/nginx/sites-available/mcp.2msp.online /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# Запустите MCP сервер
cd /X
/X/venv/bin/python /X/mcp_sse_server.py > server.log 2>&1 &

# Получите SSL
sudo certbot --nginx -d mcp.2msp.online --non-interactive --agree-tos --email admin@2msp.online --redirect
```

---

### 4️⃣ Проверьте (1 мин)

```bash
curl https://mcp.2msp.online/health
```

Должен вернуть: `{"status":"healthy",...}` ✅

---

### 5️⃣ Подключите к ChatGPT

1. ChatGPT → Settings → Connectors → New Connector
2. **URL:** `https://mcp.2msp.online/mcp`
3. **Auth:** No authentication
4. Save

---

## 🎉 Готово!

Попросите ChatGPT:
```
Создай пост на моем WordPress сайте про AI
```

---

## 🔧 Автозапуск

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

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable mcp-server
sudo systemctl start mcp-server
```

---

## 📋 Команды управления

```bash
# Статус
sudo systemctl status mcp-server

# Логи
sudo journalctl -u mcp-server -f

# Перезапуск
sudo systemctl restart mcp-server
```

---

## 🆘 Проблемы?

**502 Bad Gateway?**
```bash
sudo systemctl restart mcp-server
```

**DNS не работает?**
Подождите 5-10 минут

**Подробная инструкция:** `/X/MCP_SETUP_GUIDE.md`

