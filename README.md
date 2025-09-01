# Refook - refook.ru - Кулинарное приложение

## 🍳 Описание

Современное веб-приложение для управления рецептами с интеграцией реального API.

## 🚀 Деплой

### GitHub Pages (автоматический)

Приложение автоматически деплоится на GitHub Pages при push в ветку `v4`:

- **URL**: https://refook.ru
- **Триггер**: Ручной запуск
- **Workflow**: `.github/workflows/deploy-front.yml`

### API Integration

В production используется многоуровневая стратегия для работы с API:

1. **Прямое подключение** - пытается подключиться к API напрямую
2. **CORS Proxy** - использует Vercel proxy при необходимости
3. **Fallback** - переключается на mock данные при недоступности API

### Переменные окружения

- `VITE_USE_CORS_PROXY` - включает/отключает CORS proxy (true/false)

## 🛠 Разработка

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Сборка для продакшена
```bash
npm run build
```

### Предварительный просмотр сборки
```bash
npm run preview
```

## 📁 Структура проекта

```
src/
├── components/     # React компоненты
├── services/       # API сервисы
├── store/          # Redux store
├── types/          # TypeScript типы
└── data/           # Исходные данные
```

## 🔧 Настройки

### Vite Configuration
- **proxy**: настроен для development режима
- **build:prod**: оптимизирован для production

### API Integration
- **Development**: использует Vite proxy
- **Production**: прямое подключение + fallback на mock данные

## 📝 Функции

- ✅ Управление рецептами
- ✅ Холодильник с реальными ингредиентами из API
- ✅ Избранные рецепты  
- ✅ Списки покупок
- ✅ Адаптивный дизайн
- ✅ Автоматический деплой

## 🔗 API

Приложение интегрировано с реальным API ингредиентов:
- **Endpoint**: `https://api.refook.ru/v1/ingredient/all`
- **Fallback**: Mock данные при недоступности API

test