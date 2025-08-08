# Настройка GitHub Pages с API интеграцией

## Автоматическая настройка

1. **GitHub Actions настроен** - файл `.github/workflows/deploy.yml` создан
2. **Vite настроен** - добавлен `base: '/refook_v3/'` в `vite.config.ts`
3. **React Router настроен** - используется `HashRouter` вместо `BrowserRouter`
4. **API интеграция** - настроена многоуровневая стратегия подключения к API

## API Integration Strategy

### Development Mode
- Использует Vite proxy `/api/v1` → `https://api.refook.ru/v1`
- CORS проблемы решены через прокси

### Production Mode  
1. **Прямое подключение** - пытается подключиться к API напрямую
2. **CORS Proxy** - при включении `VITE_USE_CORS_PROXY=true`
3. **Fallback** - переключается на mock данные при ошибках

## Ручная настройка в GitHub (ОБЯЗАТЕЛЬНО)

### Шаг 1: Настройка Pages
1. Перейдите в настройки репозитория: `Settings` → `Pages`
2. В разделе "Source" выберите **"GitHub Actions"**
3. Нажмите "Configure" рядом с "GitHub Actions"

### Шаг 2: Настройка Environment Variables (опционально)
1. В разделе `Settings` → `Secrets and variables` → `Actions`
2. Добавьте переменную `VITE_USE_CORS_PROXY` со значением `"true"` если нужен CORS proxy

### Шаг 3: Проверка разрешений
1. В `Settings` → `Actions` → `General`
2. Убедитесь, что "Actions permissions" установлено в "Allow all actions and reusable workflows"
3. В разделе "Workflow permissions" выберите "Read and write permissions"

## После настройки

После каждого push в ветку `v4`:
1. GitHub Actions автоматически соберет проект с переменными окружения
2. Задеплоит его на GitHub Pages
3. Сайт будет доступен по адресу: `https://mujlax.github.io/refook_v3/`

## Проверка деплоя и API

1. Перейдите в раздел `Actions` в репозитории
2. Найдите последний workflow "Deploy to GitHub Pages"
3. Убедитесь, что все шаги выполнены успешно
4. Перейдите по ссылке в разделе "deploy" для просмотра сайта
5. **Проверьте API**: Откройте раздел "Холодильник" → "Добавить продукт"
6. **Проверьте консоль браузера** на наличие логов загрузки ингредиентов

## Устранение проблем

### Если API не работает в production:
1. Проверьте консоль браузера на ошибки CORS
2. Включите CORS proxy: установите `VITE_USE_CORS_PROXY="true"` в secrets
3. Пересоберите проект (новый push в `v4`)
4. При полном отказе API приложение переключится на mock данные

### Если деплой не работает:
1. Проверьте настройки в `Settings` → `Pages`
2. Убедитесь, что ветка `v4` разрешена для деплоя
3. Проверьте логи в `Actions` для выявления ошибок

## Локальная разработка

### Development с API прокси:
```bash
npm run dev
```

### Тестирование production сборки:
```bash
npm run build
npm run preview
```

### Проверка API в локальной production сборке:
1. Запустите `npm run preview`
2. Откройте консоль браузера
3. Проверьте логи загрузки ингредиентов
4. При ошибках API должен включиться fallback на mock данные

## Мониторинг API

В production консоль браузера покажет:
- ✅ `"Загрузка ингредиентов из: [URL]"`
- ✅ `"Успешно загружено X ингредиентов"` - при успехе
- ⚠️ `"Fallback: используем mock данные"` - при ошибке API 