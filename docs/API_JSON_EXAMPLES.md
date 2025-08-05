# Примеры JSON для API

## POST /api/v1/recipe

При создании рецепта на эндпоинт `http://localhost:5173/api/v1/recipe` отправляется следующий JSON:

### Структура запроса

```json
{
  "name": "Название рецепта",
  "description": "Описание рецепта",
  "kitchen": "RUSSIAN",
  "level": "EASY",
  "cookTime": 1800,
  "allTime": 3600,
  "portion": 4,
  "photos": [
    "12fcd2f5-f976-44bc-bd33-c495a8daff34",
    "a3bd2a15-dc26-43a7-ae92-f7c62b9edc21"
  ],
  "tags": null,
  "ingredients": [
    {
      "id": "fc01f44c-cc90-44c9-b0f4-53f586f41e30",
      "count": 500,
      "measure": "GR"
    },
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "count": 2,
      "measure": "KG"
    }
  ],
  "steps": [
    {
      "index": 1,
      "name": "Подготовка ингредиентов",
      "description": "Нарежьте овощи кубиками",
      "photos": [
        "12fcd2f5-f976-44bc-bd33-c495a8daff34"
      ],
      "time": 300
    },
    {
      "index": 2,
      "name": "Приготовление",
      "description": "Обжарьте овощи на среднем огне 10 минут",
      "photos": [
        "a3bd2a15-dc26-43a7-ae92-f7c62b9edc21"
      ],
      "time": 600
    }
  ]
}
```

### Описание полей

#### Основные поля рецепта:
- `name` (string, обязательное) - название рецепта (максимум 64 символа)
- `description` (string, обязательное) - описание рецепта (максимум 1000 символов)
- `kitchen` (string, опциональное) - тип кухни: `"RUSSIAN"` или `"ASIAN"`
- `level` (string, обязательное) - сложность: `"EASY"`, `"MEDIUM"`, `"HARD"`
- `cookTime` (integer, обязательное) - время приготовления в секундах
- `allTime` (integer, обязательное) - общее время в секундах
- `portion` (integer, обязательное) - количество порций (1-10000)

#### Медиа:
- `photos` (array of strings, опциональное) - массив ID фотографий рецепта
- `tags` (array of strings, опциональное) - массив тегов

#### Ингредиенты:
- `ingredients` (array, обязательное) - массив ингредиентов
  - `id` (string, обязательное) - UUID ингредиента
  - `count` (integer, обязательное) - количество (1-10000)
  - `measure` (string, обязательное) - единица измерения: `"ML"`, `"L"`, `"MG"`, `"GR"`, `"KG"`

#### Шаги:
- `steps` (array, обязательное) - массив шагов приготовления
  - `index` (integer, обязательное) - порядковый номер шага (1-100)
  - `name` (string, опциональное) - название шага (максимум 255 символов)
  - `description` (string, обязательное) - описание шага (максимум 2000 символов)
  - `photos` (array of strings, опциональное) - массив ID фотографий шага
  - `time` (integer, опциональное) - время выполнения шага в секундах

### Пример реального запроса

```json
{
  "name": "Паста Карбонара",
  "description": "Классическая итальянская паста с беконом, яйцами и сыром",
  "kitchen": "RUSSIAN",
  "level": "MEDIUM",
  "cookTime": 1200,
  "allTime": 1800,
  "portion": 2,
  "photos": ["12fcd2f5-f976-44bc-bd33-c495a8daff34"],
  "tags": null,
  "ingredients": [
    {
      "id": "fc01f44c-cc90-44c9-b0f4-53f586f41e30",
      "count": 200,
      "measure": "GR"
    },
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "count": 100,
      "measure": "GR"
    }
  ],
  "steps": [
    {
      "index": 1,
      "name": "Варка пасты",
      "description": "Отварите пасту в подсоленной воде согласно инструкции на упаковке",
      "photos": ["a3bd2a15-dc26-43a7-ae92-f7c62b9edc21"],
      "ingredients": [
        {
          "id": "fc01f44c-cc90-44c9-b0f4-53f586f41e30",
          "count": 200,
          "measure": "GR"
        }
      ],
      "time": 600
    },
    {
      "index": 2,
      "name": "Приготовление соуса",
      "description": "Обжарьте бекон до хрустящего состояния, добавьте яйца и сыр",
      "photos": [],
      "ingredients": [
        {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "count": 100,
          "measure": "GR"
        }
      ],
      "time": 300
    }
  ]
}
```

### Пример с названиями шагов и ингредиентами

```json
{
  "name": "Борщ украинский",
  "description": "Традиционный украинский борщ с мясом и сметаной",
  "kitchen": "RUSSIAN",
  "level": "MEDIUM",
  "cookTime": 3600,
  "allTime": 4800,
  "portion": 6,
  "photos": ["recipe-main-photo-id"],
  "tags": null,
  "ingredients": [
    {
      "id": "beef-uuid",
      "count": 500,
      "measure": "GR"
    },
    {
      "id": "beet-uuid", 
      "count": 2,
      "measure": "KG"
    },
    {
      "id": "cabbage-uuid",
      "count": 300,
      "measure": "GR"
    }
  ],
  "steps": [
    {
      "index": 1,
      "name": "Подготовка мяса",
      "description": "Нарежьте мясо крупными кусками и поставьте варить в подсоленной воде",
      "photos": ["step1-photo-id"],
      "ingredients": [
        {
          "id": "beef-uuid",
          "count": 500,
          "measure": "GR"
        }
      ],
      "time": 900
    },
    {
      "index": 2,
      "name": "Приготовление овощей",
      "description": "Натрите свеклу на крупной терке, нарежьте капусту соломкой",
      "photos": ["step2-photo-id"],
      "ingredients": [
        {
          "id": "beet-uuid",
          "count": 2,
          "measure": "KG"
        },
        {
          "id": "cabbage-uuid", 
          "count": 300,
          "measure": "GR"
        }
      ],
      "time": 1200
    },
    {
      "index": 3,
      "name": "Варка борща",
      "description": "Добавьте овощи в бульон и варите до готовности. Подавайте со сметаной",
      "photos": [],
      "ingredients": [],
      "time": 1800
    }
  ]
}
```

## Как отследить отправляемый JSON

### 1. Через DevTools в браузере

Откройте DevTools (F12) и перейдите на вкладку **Network**. При создании рецепта вы увидите запрос к `/api/v1/recipe`. Кликните на него и перейдите на вкладку **Payload** или **Request**.

### 2. Через встроенный API Logger

В правом верхнем углу приложения есть панель DevTools. В ней есть раздел **API Logger**, который показывает все запросы к API в реальном времени.

### 3. Через консоль браузера

В консоли браузера доступен глобальный объект `apiLogger`:

```javascript
// Получить все логи
apiLogger.getLogs()

// Получить логи для конкретного URL
apiLogger.getLogsForUrl('/api/v1/recipe')

// Получить последний запрос
apiLogger.getLastRequest()

// Экспортировать логи
apiLogger.exportLogs()
```

### 4. Через localStorage

Логи сохраняются в localStorage и доступны по ключу `api_logs`:

```javascript
const logs = JSON.parse(localStorage.getItem('api_logs') || '[]')
console.log(logs)
``` 