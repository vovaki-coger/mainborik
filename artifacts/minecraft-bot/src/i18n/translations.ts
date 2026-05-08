export const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
      newBot: "Deploy Unit",
      models: "AI Models",
      settings: "Settings",
      help: "Help",
    },
    dashboard: {
      title: "Mission Control",
      stats: {
        total: "Total Units",
        online: "Online",
        autonomous: "Autonomous",
        aiEnabled: "AI Enabled"
      },
      botList: "Active Units",
      noBots: "No units found. Deploy a new unit to begin.",
      status: {
        offline: "Offline",
        connecting: "Connecting",
        online: "Online",
        autonomous: "Autonomous",
        error: "Error"
      }
    },
    bot: {
      control: "Unit Control",
      connect: "Connect",
      disconnect: "Disconnect",
      delete: "Terminate Unit",
      health: "HP",
      hunger: "Food",
      xp: "Level",
      armor: "Armor",
      location: "Location",
      biome: "Biome",
      inventory: "Inventory",
      chat: "Comm Link",
      send: "Send",
      aiMode: "AI Mode",
      autoReply: "Auto-reply",
      systemPrompt: "System Prompt",
      model: "Model",
      apiKey: "API Key",
      settings: "AI Configuration",
      monitor: "Unit Monitor",
      actions: {
        stop: "Halt All",
        stopMove: "Halt Movement",
        survivor: "Survivor Mode",
        rename: "Rename Unit",
        success: "Command executed",
        error: "Command failed"
      },
      emptyInventory: "Inventory is empty"
    },
    newBot: {
      title: "Deploy New Unit",
      description: "Configure a new Minecraft automation unit.",
      name: "Unit Name",
      serverHost: "Server Host",
      serverPort: "Server Port",
      version: "Game Version",
      versionPlaceholder: "1.20.4",
      aiMode: "AI Mode",
      model: "Model",
      proxySettings: "Proxy Configuration (Optional)",
      proxyHost: "Proxy Host",
      proxyPort: "Proxy Port",
      proxyType: "Proxy Type",
      proxyUser: "Proxy User:Pass",
      autoLogin: "Auto Login",
      deploy: "Deploy Unit",
      success: "Unit deployed successfully",
      error: "Failed to deploy unit"
    },
    settings: {
      title: "System Settings",
      description: "Global configuration for the Bot Manager.",
      save: "Save Configuration",
      success: "Settings saved",
      error: "Failed to save settings",
      globalPassword: "Global Password",
      defaultProxy: "Default Proxy",
      defaultAiMode: "Default AI Mode",
      defaultModel: "Default Model",
      language: "System Language"
    },
    models: {
      title: "Model Catalog",
      description: "Manage local Ollama models for autonomous units.",
      status: {
        running: "Ollama Running",
        offline: "Ollama Offline",
        available: "Available",
        not_downloaded: "Not Downloaded",
        downloading: "Downloading..."
      },
      size: "Size",
      ramRequired: "RAM Required",
      vramRequired: "VRAM Required",
      download: "Download",
      delete: "Delete",
      success: "Action completed",
      error: "Action failed"
    },
    help: {
      title: "Command Center Help",
      ollama: "Ollama Installation",
      ollamaDesc: "To use local AI models, you must install Ollama.",
      windows: "Download for Windows",
      mac: "Download for macOS",
      linux: "Linux Installation",
      mineflayer: "Mineflayer Info",
      mineflayerDesc: "The backend uses Mineflayer for bot control.",
      faq: "FAQ",
      q1: "How to connect a bot?",
      a1: "Deploy a bot from the 'Deploy Unit' page, then click the power button.",
      q2: "Why is the bot not responding in chat?",
      a2: "Ensure Auto-reply is enabled and the AI mode is correctly configured."
    },
    common: {
      loading: "Loading...",
      saving: "Saving...",
      back: "Back",
      cancel: "Cancel",
      confirm: "Confirm"
    }
  },
  ru: {
    nav: {
      dashboard: "Панель управления",
      newBot: "Создать юнита",
      models: "ИИ Модели",
      settings: "Настройки",
      help: "Помощь",
    },
    dashboard: {
      title: "Центр управления",
      stats: {
        total: "Всего юнитов",
        online: "В сети",
        autonomous: "Автономных",
        aiEnabled: "С ИИ"
      },
      botList: "Активные единицы",
      noBots: "Боты не найдены. Разверните новую единицу для начала.",
      status: {
        offline: "Оффлайн",
        connecting: "Подключение",
        online: "Онлайн",
        autonomous: "Автономный",
        error: "Ошибка"
      }
    },
    bot: {
      control: "Управление юнитом",
      connect: "Подключить",
      disconnect: "Отключить",
      delete: "Уничтожить",
      health: "Здоровье",
      hunger: "Сытость",
      xp: "Уровень",
      armor: "Броня",
      location: "Координаты",
      biome: "Биом",
      inventory: "Инвентарь",
      chat: "Связь",
      send: "Отправить",
      aiMode: "Режим ИИ",
      autoReply: "Автоответ",
      systemPrompt: "Системный промпт",
      model: "Модель",
      apiKey: "API Ключ",
      settings: "Конфигурация ИИ",
      monitor: "Монитор",
      actions: {
        stop: "Остановить всё",
        stopMove: "Остановить движение",
        survivor: "Режим выживания",
        rename: "Переименовать",
        success: "Команда выполнена",
        error: "Ошибка выполнения"
      },
      emptyInventory: "Инвентарь пуст"
    },
    newBot: {
      title: "Развернуть нового юнита",
      description: "Настройка нового бота для автоматизации.",
      name: "Имя юнита",
      serverHost: "Хост сервера",
      serverPort: "Порт сервера",
      version: "Версия игры",
      versionPlaceholder: "1.20.4",
      aiMode: "Режим ИИ",
      model: "Модель",
      proxySettings: "Настройки прокси (Необязательно)",
      proxyHost: "Хост прокси",
      proxyPort: "Порт прокси",
      proxyType: "Тип прокси",
      proxyUser: "Пользователь:Пароль",
      autoLogin: "Авто-вход",
      deploy: "Развернуть",
      success: "Юнит успешно развернут",
      error: "Ошибка развертывания"
    },
    settings: {
      title: "Системные настройки",
      description: "Глобальная конфигурация.",
      save: "Сохранить конфигурацию",
      success: "Настройки сохранены",
      error: "Ошибка сохранения",
      globalPassword: "Глобальный пароль",
      defaultProxy: "Прокси по умолчанию",
      defaultAiMode: "Режим ИИ по умолчанию",
      defaultModel: "Модель по умолчанию",
      language: "Язык системы"
    },
    models: {
      title: "Каталог моделей",
      description: "Управление локальными моделями Ollama.",
      status: {
        running: "Ollama работает",
        offline: "Ollama оффлайн",
        available: "Доступно",
        not_downloaded: "Не скачано",
        downloading: "Скачивание..."
      },
      size: "Размер",
      ramRequired: "Требуется RAM",
      vramRequired: "Требуется VRAM",
      download: "Скачать",
      delete: "Удалить",
      success: "Действие выполнено",
      error: "Ошибка выполнения"
    },
    help: {
      title: "Справка",
      ollama: "Установка Ollama",
      ollamaDesc: "Для использования локальных ИИ моделей необходимо установить Ollama.",
      windows: "Скачать для Windows",
      mac: "Скачать для macOS",
      linux: "Установка на Linux",
      mineflayer: "О Mineflayer",
      mineflayerDesc: "Бэкенд использует Mineflayer для управления ботами.",
      faq: "Частые вопросы",
      q1: "Как подключить бота?",
      a1: "Создайте бота на странице 'Создать юнита', затем нажмите кнопку питания.",
      q2: "Почему бот не отвечает в чате?",
      a2: "Убедитесь, что включен Автоответ и правильно настроен режим ИИ."
    },
    common: {
      loading: "Загрузка...",
      saving: "Сохранение...",
      back: "Назад",
      cancel: "Отмена",
      confirm: "Подтвердить"
    }
  }
};

export type Language = 'en' | 'ru';
export type TranslationKey = keyof typeof translations.en;
