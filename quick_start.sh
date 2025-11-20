#!/bin/bash
echo "🚀 WordPress MCP Server - Quick Start"
echo "======================================"

# 1. Установить зависимости
echo "📦 Installing dependencies..."
pip3 install mcp fastapi uvicorn httpx pydantic python-dotenv sse-starlette --quiet

# 2. Запустить сервер в фоне
echo "🔧 Starting MCP server..."
nohup python3 mcp_sse_server.py > server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Ждем запуска сервера
sleep 3

# 3. Проверка сервера
echo ""
echo "✅ Server health check:"
curl -s http://localhost:8000/health 2>/dev/null || echo "Server starting..."

# 4. Запустить Cloudflare Tunnel
echo ""
echo "🌐 Starting Cloudflare Tunnel..."

# Проверяем, установлен ли cloudflared
if ! command -v cloudflared &> /dev/null; then
    echo "Installing cloudflared..."
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
    chmod +x cloudflared-linux-amd64
    sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
fi

# Запускаем tunnel
nohup cloudflared tunnel --url http://localhost:8000 > cloudflared.log 2>&1 &
TUNNEL_PID=$!

sleep 5

# 5. Получить URL
echo ""
echo "======================================"
echo "✅ ГОТОВО! Ваша ссылка для ChatGPT:"
echo "======================================"
cat cloudflared.log | grep -o 'https://[^ ]*trycloudflare.com' | head -1
echo ""
echo "📋 Используйте в ChatGPT:"
echo "   Settings → Connectors → New Connector"
echo "   URL: <ваша ссылка>/sse"
echo ""
echo "======================================"
echo "PIDs для остановки:"
echo "  Server: $SERVER_PID"
echo "  Tunnel: $TUNNEL_PID"
echo ""
echo "Остановить: kill $SERVER_PID $TUNNEL_PID"
