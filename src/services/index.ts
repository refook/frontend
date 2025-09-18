// Экспорт всех сервисов
export { default as apiService } from './api';
export { RecipesService } from './recipesService';
export { FavoritesService } from './favoritesService';
export { FridgeService } from './fridgeService';
export { ingredientsService } from './ingredientsService';
export { realRecipesService } from './realRecipesService';
export * from './storageUtils';
export { productsService } from './productsService';

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
  AddFridgeItemForm,
  ApiIngredient
} from '../types'; 