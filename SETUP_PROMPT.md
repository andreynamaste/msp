# Промпт для воссоздания проекта Склейка видео

## Инструкция для AI ассистента

Создай веб-сервис для склейки видео "Склейка видео" на Python с использованием FastAPI. Проект должен включать следующее:

### 1. Основная структура проекта

Создай директорию проекта и следующие файлы:
- `glass_design_main.py` - основной файл FastAPI приложения
- `api_key_system.py` - система управления API ключами
- `persistent_users.py` - система управления пользователями
- `requirements.txt` - зависимости Python
- `users.json` - файл для хранения пользователей (создается автоматически)
- `api_keys.json` - файл для хранения API ключей (создается автоматически)
- `backups/` - директория для резервных копий

### 2. Зависимости (requirements.txt)

```
fastapi>=0.104.0
uvicorn>=0.24.0
aiofiles>=23.2.0
aiohttp>=3.9.0
ffmpeg-python>=0.2.0
python-multipart>=0.0.6
pydantic>=2.5.0
PyJWT>=2.8.0
```

### 3. Основные требования к функциональности

#### 3.1. Аутентификация
- Регистрация пользователей с email, username, password, plan (free/pro/enterprise)
- Хеширование паролей через PBKDF2-SHA256 с солью "scotch_salt_2024"
- Вход с получением JWT токена (срок действия 1 час)
- Система API ключей:
  - Автоматическое создание API ключа при регистрации
  - Возможность создания нескольких API ключей
  - Хеширование API ключей через SHA256
  - Срок действия ключей (по умолчанию 365 дней)
  - Отзыв ключей (одиночный и массовый)

#### 3.2. Склейка видео
- Endpoint: `POST /server2/videoapi/merge`
- Параметры запроса:
  - `video_urls`: список URL видео (1-5 видео)
  - `aspect_ratio`: "16:9", "9:16", "1:1", "4:3"
  - `quality`: "low", "medium", "high", "ultra"
- Асинхронная обработка в фоне
- Отслеживание прогресса через `GET /server2/videoapi/task/{task_id}`
- Кэширование результатов (в памяти)
- Лимит размера видео: 20 МБ на файл

#### 3.3. Веб-интерфейс (Glass дизайн)
- Главная страница (`GET /`) с кнопками регистрации и входа
- Страница регистрации (`GET /register`) с формой
- Страница входа (`GET /login`) с формой
- Glass дизайн с:
  - Градиентным фоном (135deg, #667eea to #764ba2)
  - Backdrop blur эффектами
  - Анимированным фоном
  - Адаптивным дизайном
  - Плавными анимациями

#### 3.4. API Endpoints

**Публичные:**
- `GET /` - главная страница
- `GET /register` - страница регистрации
- `GET /login` - страница входа
- `GET /server2/videoapi/` - информация об API
- `GET /server2/videoapi/health` - проверка состояния
- `GET /server2/videoapi/download/{task_id}` - скачивание видео

**Защищенные (Bearer token):**
- `POST /server2/videoapi/auth/register` - регистрация
- `POST /server2/videoapi/auth/login` - вход
- `POST /server2/videoapi/merge` - склейка видео
- `GET /server2/videoapi/task/{task_id}` - статус задачи
- `POST /server2/videoapi/auth/create-api-key` - создание API ключа
- `GET /server2/videoapi/auth/api-keys` - список API ключей
- `DELETE /server2/videoapi/auth/api-keys/{key_id}` - отзыв ключа
- `DELETE /server2/videoapi/auth/api-keys` - отзыв всех ключей
- `GET /server2/videoapi/auth/verify` - проверка API ключа

### 4. Технические детали

#### 4.1. Конфигурация FastAPI
- Title: "Склейка видео"
- Version: "4.0"
- Root path: "/scotch"
- CORS: разрешены все origins
- SECRET_KEY: "your-secret-key-change-in-production"
- ALGORITHM: "HS256"

#### 4.2. Обработка видео (FFmpeg)
- Разрешения:
  - 16:9 → 1920x1080
  - 9:16 → 1080x1920
  - 1:1 → 1080x1080
  - 4:3 → 1440x1080
- Качество:
  - low: preset="veryfast", crf="28"
  - medium: preset="fast", crf="23"
  - high: preset="slow", crf="18"
  - ultra: preset="slower", crf="15"
- Кодек: libx264 (видео), aac (аудио)
- Формат: MP4 с faststart

#### 4.3. Хранение данных
- Пользователи: JSON файл `users.json`
- API ключи: JSON файл `api_keys.json`
- Резервные копии: автоматические в `backups/`
- Временные файлы: `/tmp/video_merge_{task_id}.mp4`

#### 4.4. Прогресс задач
- Отслеживание в словаре `task_progress`
- Статусы: "starting", "downloading", "preparing", "merging", "completed", "error"
- Прогресс: 0-100%
- Response включает `success_flag`: 1 (готово) или 0 (обрабатывается)

### 5. Особенности реализации

1. **Двойная аутентификация**: `get_current_user()` проверяет сначала JWT, потом API ключ
2. **Кэширование**: ключ кэша = sorted URLs + aspect_ratio + quality
3. **Очистка**: автоматическое удаление временных файлов после обработки
4. **Резервное копирование**: перед сохранением API ключей создается бэкап
5. **Rate limiting**: функция есть, но отключена (pass)

### 6. Модели данных (Pydantic)

```python
class VideoMergeRequest(BaseModel):
    video_urls: List[HttpUrl]  # 1-5 URL
    aspect_ratio: str = "16:9"
    quality: str = "medium"

class VideoMergeResponse(BaseModel):
    task_id: str
    status: str
    message: str
    download_url: Optional[str] = None
    cache_hit: bool = False

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str
    plan: str = "free"
```

### 7. Запуск приложения

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
```

### 8. Важные детали

- Все пути API начинаются с `/scotch/server2/videoapi/`
- Download URL формируется как `https://your-domain.com/scotch/server2/videoapi/download/{task_id}` 
  - **ВАЖНО**: Замените `your-domain.com` на ваш реальный домен в коде приложения
  - Рекомендуется использовать переменную окружения `BASE_URL` вместо hardcoded URL
- Task ID генерируется как `task_{timestamp_microseconds}_{random_4digits}`
- API ключи генерируются через `secrets.token_urlsafe(32)`
- Пароли хешируются через `hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)`
- В ответе статуса задачи `success_flag` должен быть ЧИСЛОМ (1 или 0), не строкой!

### 9. Структура файлов

**glass_design_main.py** должен содержать:
- Импорты всех зависимостей
- Конфигурацию FastAPI
- Glass CSS стили
- HTML шаблоны для веб-страниц
- Все API endpoints
- Функцию обработки видео `process_video_merge()`

**api_key_system.py** должен содержать:
- Класс `APIKeyManager` с методами создания, проверки, отзыва ключей
- Функции-обертки для удобного использования
- Автоматическое резервное копирование

**persistent_users.py** должен содержать:
- Функции загрузки/сохранения пользователей и API ключей
- Хеширование паролей
- Функции: `add_user()`, `verify_user()`, `get_user()`

### 10. Проверка работоспособности

После создания проекта проверь:
1. Установку зависимостей: `pip install -r requirements.txt`
2. Наличие FFmpeg: `ffmpeg -version`
3. Запуск сервера: `python glass_design_main.py`
4. Доступность главной страницы: `http://localhost:3001/scotch/`
5. Регистрацию пользователя через веб-интерфейс
6. Создание задачи склейки видео через API

### 11. Дополнительные файлы (опционально)

Можно создать конфигурационные файлы для интеграций:
- `scotch-base.jsonc` - базовая конфигурация
- `scotch-connection.jsonc` - конфигурация подключения с полем API ключа

---

**Важно**: При воссоздании проекта убедись, что:
- FFmpeg установлен в системе
- Python версии 3.12+
- Все пути к файлам абсолютные или относительные к рабочей директории
- SECRET_KEY изменен на безопасный в продакшене
- Директория `/tmp` доступна для записи
- **Все hardcoded URL в коде заменены на ваш домен** (например, `https://your-domain.com` → ваш реальный домен)
- В конфигурационных файлах (если создаются) также замените все URL на ваши

