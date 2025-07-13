# Тестовые данные

Эта папка содержит начальные данные для mock API.

## Структура файлов

- `initialRecipes.ts` - Начальные рецепты
- `initialIngredients.ts` - Начальные ингредиенты  
- `initialCategories.ts` - Категории ингредиентов
- `initialUsers.ts` - Тестовые пользователи
- `index.ts` - Экспорт всех данных

## Использование

```typescript
import { initialRecipes, initialIngredients, initialCategories, initialUsers } from '../data';
```

## Изменение данных

Для изменения тестовых данных редактируйте соответствующие файлы в этой папке. Данные автоматически подхватятся mock API при инициализации.

## Изображения

- **Рецепты**: используют `https://random.danielpetrica.com/api/random`
- **Аватары**: используют DiceBear API с уникальными seed'ами 