# camp

Лендинг летнего бизнес-лагеря 2026 года.

## Разработка

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

Готовая сборка создаётся в каталоге `dist`.

## Деплой на Vercel

Проект настроен как Vite-приложение:

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

При импорте GitHub-репозитория Vercel прочитает эти параметры из `vercel.json`.
