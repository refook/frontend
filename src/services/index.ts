// Экспорт всех сервисов
export { default as apiService } from './api';
export { mockApi } from './mockApi';
export { RecipesService } from './recipesService';
export { FavoritesService } from './favoritesService';
export { FridgeService } from './fridgeService';
export { ingredientsService } from './ingredientsService';
export * from './storageUtils';

// Экспорт типов для удобства
export type { 
  Recipe, 
  CreateRecipeForm, 
  RecipeFilters, 
  RecipeSort, 
  PaginatedResponse, 
  ApiResponse, 
  ApiError,
  Ingredient,
  IngredientCategory,
  User,
  FridgeItem,
  Favorite,
  AddFridgeItemForm
} from '../types'; 