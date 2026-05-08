# MC Bot Manager — Electron Desktop App

Это Electron-обёртка для превращения веб-приложения в нативное десктопное приложение.

## Быстрый старт (локально)

### 1. Клонируй репозиторий

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Установи зависимости

```bash
npm install -g pnpm
pnpm install
```

### 3. Собери фронтенд и бэкенд

```bash
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/minecraft-bot run build
```

### 4. Запусти Electron в dev-режиме

```bash
cd electron-app
npm install
npm start
```

---

## Сборка установщиков

### Windows (.exe)
```bash
cd electron-app
npm run build:win
# Результат: electron-app/dist/MC-Bot-Manager-Setup.exe
```

### macOS (.dmg)
```bash
cd electron-app
npm run build:mac
# Результат: electron-app/dist/MC-Bot-Manager.dmg
```

### Linux (.AppImage + .deb)
```bash
cd electron-app
npm run build:linux
# Результат: electron-app/dist/*.AppImage и *.deb
```

### Все платформы сразу
```bash
cd electron-app
npm run build:all
```

---

## Автоматическая сборка через GitHub Actions

Сборка запускается автоматически при:
- Создании тега `v*` (например `v1.0.0`) — создаёт GitHub Release с файлами
- Ручном запуске через GitHub Actions → "Build Electron App" → "Run workflow"

### Как создать релиз:
```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions соберёт `.exe`, `.dmg`, `.AppImage`, `.deb` и опубликует их в разделе Releases.

---

## Требования для запуска приложения

- **Ollama** — https://ollama.com (для локального ИИ)
- **Minecraft Java Edition** сервер (для подключения ботов)
- База данных: SQLite (встроена) или PostgreSQL (через `DATABASE_URL`)
