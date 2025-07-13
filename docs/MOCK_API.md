# Mock API - Документация

## Обзор

Mock API - это глубокая симуляция реального бэкенда, которая позволяет разрабатывать и тестировать приложение без необходимости создания настоящего сервера. Все данные хранятся в localStorage браузера и имитируют поведение реальной базы данных.

## Особенности

### ✅ Что реализовано

- **Полная CRUD операция** для всех сущностей
- **Имитация задержек сети** (200-3000ms)
- **Валидация данных** на уровне API
- **Обработка ошибок** с типизированными сообщениями
- **Пагинация** с фильтрацией и сортировкой
- **Поиск** по тексту и атрибутам
- **Персистентность данных** в localStorage
- **Инициализация начальными данными**
- **Типизация** всех методов и ответов

### 🗄️ Поддерживаемые сущности

1. **Рецепты** (`Recipe`) - полный CRUD
2. **Ингредиенты** (`Ingredient`) - чтение и создание
3. **Категории ингредиентов** (`IngredientCategory`) - чтение
4. **Пользователи** (`User`) - чтение
5. **Избранное** (`Favorite`) - полный CRUD
6. **Холодильник** (`FridgeItem`) - полный CRUD

## Использование

### Импорт сервисов

```typescript
import { 
  RecipesService, 
  FavoritesService, 
  FridgeService,
  mockApi 
} from '../services';
```

### Работа с рецептами

```typescript
// Получение списка рецептов с пагинацией
const recipes = await RecipesService.getRecipes(1, 12);

// Поиск рецептов
const searchResults = await RecipesService.searchRecipes('борщ');

// Создание рецепта
const newRecipe = await RecipesService.createRecipe(formData);

// Получение одного рецепта
const recipe = await RecipesService.getRecipe('recipe-id');

// Обновление рецепта
const updatedRecipe = await RecipesService.updateRecipe('recipe-id', updates);

// Удаление рецепта
await RecipesService.deleteRecipe('recipe-id');
```

### Работа с избранным

```typescript
// Получение избранных рецептов
const favorites = await FavoritesService.getFavorites('user-id');

// Добавление в избранное
await FavoritesService.addToFavorites('user-id', 'recipe-id');

// Удаление из избранного
await FavoritesService.removeFromFavorites('user-id', 'recipe-id');

// Переключение избранного
const isFavorite = await FavoritesService.toggleFavorite('user-id', 'recipe-id');
```

### Работа с холодильником

```typescript
// Получение продуктов в холодильнике
const items = await FridgeService.getFridgeItems('user-id');

// Добавление продукта
const newItem = await FridgeService.addFridgeItem('user-id', {
  ingredientId: 'beef',
  amount: 500,
  unit: 'г',
  expirationDate: '2024-02-15',
  location: 'fridge'
});

// Получение продуктов с истекающим сроком
const expiringItems = await FridgeService.getExpiringItems('user-id', 7);

// Использование ингредиента (уменьшение количества)
await FridgeService.useIngredient('user-id', 'beef', 100);
```

### Фильтрация и сортировка

```typescript
// Фильтры для рецептов
const filters: RecipeFilters = {
  search: 'борщ',
  cuisine: ['Украинская'],
  difficulty: ['easy', 'medium'],
  prepTime: { min: 10, max: 60 },
  servings: { min: 2, max: 6 },
  tags: ['суп', 'традиционный']
};

// Сортировка
const sort: RecipeSort = {
  field: 'rating',
  order: 'desc'
};

// Применение фильтров и сортировки
const filteredRecipes = await RecipesService.getRecipes(1, 12, filters, sort);
```

## Структура данных

### Начальные данные

При первом запуске Mock API автоматически создает:

- **2 рецепта**: "Классический борщ" и "Паста Карбонара"
- **3 ингредиента**: Говядина, Свекла, Спагетти
- **5 категорий**: Мясо, Овощи, Макароны, Молочные продукты, Специи
- **2 пользователя**: Мария Петрова и Алексей Иванов

### Хранение данных

Все данные сохраняются в localStorage с префиксом `mock_`:

- `mock_recipes` - рецепты
- `mock_ingredients` - ингредиенты
- `mock_categories` - категории
- `mock_users` - пользователи
- `mock_favorites` - избранное
- `mock_fridge` - холодильник

## Обработка ошибок

Mock API возвращает типизированные ошибки:

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

### Коды ошибок

- `VALIDATION_ERROR` - ошибка валидации данных
- `NOT_FOUND` - ресурс не найден
- `DUPLICATE_ERROR` - дублирование данных
- `NETWORK_ERROR` - ошибка сети (не используется в mock)
- `UNKNOWN_ERROR` - неизвестная ошибка

### Пример обработки

```typescript
try {
  const recipe = await RecipesService.createRecipe(formData);
  console.log('Рецепт создан:', recipe);
} catch (error: any) {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('Ошибка валидации:', error.message);
  } else if (error.code === 'NOT_FOUND') {
    console.error('Рецепт не найден');
  } else {
    console.error('Неизвестная ошибка:', error.message);
  }
}
```

## Утилиты и хелперы

### RecipesService

```typescript
// Валидация формы
const validation = RecipesService.validateRecipeForm(formData);
if (!validation.isValid) {
  console.error('Ошибки:', validation.errors);
}

// Форматирование
const time = RecipesService.formatCookingTime(30, 45); // "1 ч 15 мин"
const difficulty = RecipesService.formatDifficulty('medium'); // "Средне"
const color = RecipesService.getDifficultyColor('easy'); // "#51cf66"

// Проверки
const isQuick = RecipesService.isQuickRecipe(recipe); // < 30 мин
const isPopular = RecipesService.isPopularRecipe(recipe); // рейтинг > 4.5
```

### FridgeService

```typescript
// Форматирование дат
const expiration = FridgeService.formatExpirationDate('2024-02-15');
const color = FridgeService.getExpirationColor('2024-02-15');

// Статистика
const stats = await FridgeService.getFridgeStats('user-id');
console.log(`Всего продуктов: ${stats.totalItems}`);
console.log(`Истекает скоро: ${stats.expiringSoon}`);
```

## Тестирование

### Сброс данных

Для тестирования можно сбросить все данные:

```typescript
// Сброс всех данных
mockApi.resetData();

// Или через сервис
RecipesService.resetData();
```

### Отладка

Включите отладку в консоли браузера:

```typescript
// Просмотр всех данных
console.log('Рецепты:', JSON.parse(localStorage.getItem('mock_recipes') || '[]'));
console.log('Ингредиенты:', JSON.parse(localStorage.getItem('mock_ingredients') || '[]'));
```

## Миграция на реальный API

Когда будете готовы перейти на реальный бэкенд:

1. Замените импорты `mockApi` на `apiService`
2. Обновите URL эндпоинтов в `api.ts`
3. Настройте аутентификацию
4. Обновите обработку ошибок под реальные HTTP статусы

Сервисы (`RecipesService`, `FavoritesService`, `FridgeService`) останутся без изменений, так как они абстрагируют логику работы с API.

## Производительность

- **Задержки**: 100-3000ms (имитация реальной сети)
- **Хранение**: localStorage (до 5-10MB)
- **Поиск**: O(n) по массиву (для больших данных рекомендуется индексация)
- **Фильтрация**: in-memory (для production нужна серверная фильтрация)

## Ограничения

- Данные хранятся только в браузере
- Нет синхронизации между вкладками
- Ограничения localStorage (размер, тип данных)
- Нет реальной аутентификации
- Нет валидации на сервере

## Заключение

Mock API предоставляет полнофункциональную среду для разработки фронтенда без зависимости от бэкенда. Все методы типизированы и готовы к использованию в production после замены на реальные API вызовы. 