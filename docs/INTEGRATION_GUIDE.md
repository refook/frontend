# Руководство по интеграции Mock API

## Обзор

Это руководство описывает, как новый Mock API интегрирован в пользовательский интерфейс приложения. Все компоненты теперь используют типизированные сервисы и Redux thunk'и для работы с данными.

## Архитектура интеграции

### 1. **Сервисы** (`src/services/`)
- **`RecipesService`** - работа с рецептами
- **`FavoritesService`** - управление избранным  
- **`FridgeService`** - управление холодильником
- **`mockApi`** - базовая симуляция API

### 2. **Redux Thunk'и** (`src/store/thunks/`)
- **`recipesThunks.ts`** - асинхронные операции с рецептами
- **`favoritesThunks.ts`** - операции с избранным
- **`fridgeThunks.ts`** - операции с холодильником

### 3. **Компоненты UI**
- **`Notification`** - система уведомлений
- **`useNotification`** - хук для управления уведомлениями

## Интегрированные страницы

### ✅ CreateRecipePage
- Использует `createRecipe` thunk
- Валидация через `RecipesService.validateRecipeForm()`
- Уведомления об ошибках через `useNotification`

### ✅ RecipesPage  
- Использует `fetchRecipes` thunk с фильтрами и пагинацией
- Автоматическая загрузка при изменении фильтров
- Кнопка "Показать ещё" с пагинацией

### ✅ RecipeDetailPage
- Использует `fetchRecipe` thunk
- Загрузка состояния и обработка ошибок
- Форматирование через `RecipesService` утилиты

## Использование в компонентах

### Подключение thunk'ов

```typescript
import { useAppDispatch } from '../store';
import { fetchRecipes, createRecipe } from '../store/thunks';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  
  // Загрузка рецептов
  useEffect(() => {
    dispatch(fetchRecipes({ page: 1, limit: 12 }));
  }, [dispatch]);
  
  // Создание рецепта
  const handleSubmit = async (formData) => {
    try {
      const recipe = await dispatch(createRecipe(formData)).unwrap();
      // Успешное создание
    } catch (error) {
      // Обработка ошибки
    }
  };
};
```

### Использование уведомлений

```typescript
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';

const MyComponent = () => {
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  
  const handleAction = async () => {
    try {
      // Выполнение действия
      showSuccess('Успех', 'Действие выполнено успешно');
    } catch (error) {
      showError('Ошибка', error.message);
    }
  };
  
  return (
    <div>
      {/* Компонент */}
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
      />
    </div>
  );
};
```

### Использование сервисов напрямую

```typescript
import { RecipesService, FavoritesService } from '../services';

// Валидация формы
const validation = RecipesService.validateRecipeForm(formData);
if (!validation.isValid) {
  console.error('Ошибки:', validation.errors);
}

// Форматирование данных
const time = RecipesService.formatCookingTime(30, 45); // "1 ч 15 мин"
const difficulty = RecipesService.formatDifficulty('medium'); // "Средне"

// Проверки
const isQuick = RecipesService.isQuickRecipe(recipe); // < 30 мин
const isPopular = RecipesService.isPopularRecipe(recipe); // рейтинг > 4.5
```

## Состояние Redux

### Recipes Slice
```typescript
interface RecipesState {
  items: Recipe[];
  currentRecipe: Recipe | null;
  loading: boolean;
  error: string | null;
  filters: RecipeFilters;
  sort: RecipeSort;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
```

### Favorites Slice
```typescript
interface FavoritesState {
  items: Favorite[];
  loading: boolean;
  error: string | null;
}
```

### Fridge Slice
```typescript
interface FridgeState {
  items: FridgeItem[];
  loading: boolean;
  error: string | null;
}
```

## Обработка ошибок

### Типизированные ошибки
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
- `NETWORK_ERROR` - ошибка сети
- `UNKNOWN_ERROR` - неизвестная ошибка

### Обработка в компонентах
```typescript
try {
  const result = await dispatch(someThunk()).unwrap();
  // Успешное выполнение
} catch (error: any) {
  if (error.code === 'VALIDATION_ERROR') {
    showError('Ошибка валидации', error.message);
  } else if (error.code === 'NOT_FOUND') {
    showError('Не найдено', 'Запрашиваемый ресурс не найден');
  } else {
    showError('Ошибка', error.message || 'Произошла неизвестная ошибка');
  }
}
```

## Пагинация

### Автоматическая загрузка
```typescript
useEffect(() => {
  dispatch(fetchRecipes({
    page: pagination.page,
    limit: pagination.limit,
    filters,
    sort
  }));
}, [dispatch, filters, sort, pagination.page]);
```

### Кнопка "Показать ещё"
```typescript
const loadMoreRecipes = () => {
  const nextPage = pagination.page + 1;
  dispatch(setPage(nextPage));
};

{pagination.hasMore && (
  <LoadMoreButton 
    onClick={loadMoreRecipes}
    loading={loading}
  />
)}
```

## Фильтрация и поиск

### Применение фильтров
```typescript
const filters: RecipeFilters = {
  search: 'борщ',
  cuisine: ['Украинская'],
  difficulty: ['easy', 'medium'],
  prepTime: { min: 10, max: 60 },
  servings: { min: 2, max: 6 },
  tags: ['суп', 'традиционный']
};

dispatch(fetchRecipes({ filters }));
```

### Поиск
```typescript
dispatch(searchRecipes({ query: 'борщ', page: 1, limit: 12 }));
```

## Утилиты и хелперы

### RecipesService
- `validateRecipeForm()` - валидация формы рецепта
- `formatCookingTime()` - форматирование времени
- `formatDifficulty()` - форматирование сложности
- `getDifficultyColor()` - цвет сложности
- `isQuickRecipe()` - проверка быстрого рецепта
- `isPopularRecipe()` - проверка популярности

### FridgeService
- `formatExpirationDate()` - форматирование даты истечения
- `getExpirationColor()` - цвет срока годности
- `getFridgeStats()` - статистика холодильника

## Тестирование

### Сброс данных
```typescript
import { mockApi } from '../services/mockApi';

// Сброс всех данных для тестирования
mockApi.resetData();
```

### Отладка
```typescript
// Просмотр данных в консоли
console.log('Рецепты:', JSON.parse(localStorage.getItem('mock_recipes') || '[]'));
console.log('Избранное:', JSON.parse(localStorage.getItem('mock_favorites') || '[]'));
```

## Миграция на реальный API

Когда будете готовы перейти на реальный бэкенд:

1. **Замените импорты**:
   ```typescript
   // Было
   import { mockApi } from '../services/mockApi';
   
   // Станет
   import { apiService } from '../services/api';
   ```

2. **Обновите сервисы** для использования реальных эндпоинтов

3. **Настройте аутентификацию** в `api.ts`

4. **Обновите обработку ошибок** под реальные HTTP статусы

5. **Thunk'и и компоненты останутся без изменений**

## Преимущества интеграции

✅ **Типобезопасность** - полная типизация всех операций  
✅ **Единообразие** - все компоненты используют одинаковые паттерны  
✅ **Обработка ошибок** - централизованная обработка с уведомлениями  
✅ **Состояние загрузки** - индикаторы загрузки во всех компонентах  
✅ **Пагинация** - автоматическая загрузка с кнопкой "Показать ещё"  
✅ **Фильтрация** - поиск и фильтры с автоматическим обновлением  
✅ **Утилиты** - готовые функции для форматирования и валидации  
✅ **Тестируемость** - легко тестировать с mock данными  

## Заключение

Интеграция Mock API обеспечивает полнофункциональную среду разработки с реалистичным поведением, типизацией и готовностью к переходу на реальный бэкенд. Все компоненты теперь работают с единым API через Redux thunk'и, что обеспечивает консистентность и масштабируемость приложения. 