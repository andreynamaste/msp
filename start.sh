#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/X/opt/video"
APP_FILE="$PROJECT_ROOT/glass_design_main.py"
APP_URL="https://2msp.online/"
EXTERNAL_URL="https://2msp.online/"

if [[ ! -f "$APP_FILE" ]]; then
  echo "Не найден файл приложения: $APP_FILE" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 не установлен в окружении" >&2
  exit 1
fi

python3 "$APP_FILE" &
SERVER_PID=$!

cleanup() {
  if ps -p "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup INT TERM EXIT

sleep 3
python3 -m webbrowser "$APP_URL" >/dev/null 2>&1 || true
echo "Сервер запущен."
echo "Локально: $APP_URL"
echo "Внешний адрес (если DNS настроен): $EXTERNAL_URL"
echo "(нажмите Ctrl+C для остановки)"

wait "$SERVER_PID"



