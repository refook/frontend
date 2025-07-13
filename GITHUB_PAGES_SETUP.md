# Настройка GitHub Pages

## Автоматическая настройка

1. **GitHub Actions настроен** - файл `.github/workflows/deploy.yml` создан
2. **Vite настроен** - добавлен `base: '/refook_v3/'` в `vite.config.ts`
3. **React Router настроен** - используется `HashRouter` вместо `BrowserRouter`

## Ручная настройка в GitHub (ОБЯЗАТЕЛЬНО)

### Шаг 1: Настройка Pages
1. Перейдите в настройки репозитория: `Settings` → `Pages`
2. В разделе "Source" выберите **"GitHub Actions"**
3. Нажмите "Configure" рядом с "GitHub Actions"

### Шаг 2: Настройка Environment (если требуется)
1. В разделе `Settings` → `Environments`
2. Если есть environment "github-pages", нажмите на него
3. В разделе "Deployment branches" добавьте ветку `v4`
4. Или удалите environment полностью, если он создает проблемы

### Шаг 3: Проверка разрешений
1. В `Settings` → `Actions` → `General`
2. Убедитесь, что "Actions permissions" установлено в "Allow all actions and reusable workflows"
3. В разделе "Workflow permissions" выберите "Read and write permissions"

## После настройки

После каждого push в ветку `v4`:
1. GitHub Actions автоматически соберет проект
2. Задеплоит его на GitHub Pages
3. Сайт будет доступен по адресу: `https://mujlax.github.io/refook_v3/`

## Проверка деплоя

1. Перейдите в раздел `Actions` в репозитории
2. Найдите последний workflow "Deploy to GitHub Pages"
3. Убедитесь, что все шаги выполнены успешно
4. Перейдите по ссылке в разделе "deploy" для просмотра сайта

## Устранение проблем

### Если деплой не работает:
1. Проверьте настройки в `Settings` → `Pages`
2. Убедитесь, что ветка `v4` разрешена для деплоя
3. Проверьте логи в `Actions` для выявления ошибок

## Локальная разработка

Для локальной разработки используйте:
```bash
npm run dev
```

Для предварительного просмотра production сборки:
```bash
npm run build
npm run preview
``` 