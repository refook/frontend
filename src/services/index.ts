// Экспорт всех сервисов
export { RecipesService } from './recipesService';
export { FavoritesService } from './favoritesService';
export { FridgeService } from './fridgeService';
export { mockApi } from './mockApi';
export { default as apiService } from './api';
export { StorageUtils } from './storageUtils';

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