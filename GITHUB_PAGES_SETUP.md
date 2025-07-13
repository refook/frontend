# Настройка GitHub Pages

## Автоматическая настройка

1. **GitHub Actions уже настроен** - файл `.github/workflows/deploy.yml` создан
2. **Vite настроен** - добавлен `base: '/refook_v3/'` в `vite.config.ts`
3. **React Router настроен** - используется `HashRouter` вместо `BrowserRouter`

## Ручная настройка в GitHub

1. Перейдите в настройки репозитория: `Settings` → `Pages`
2. В разделе "Source" выберите "GitHub Actions"
3. Убедитесь, что ветка `v4` выбрана как источник

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