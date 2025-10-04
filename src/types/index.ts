import type {DifficultyLevel, KitchenType, RecipeIngredientDto, StateDto, StepResponseDto} from "./recipe.types.ts";

export * from './common.types.ts'
export * from './favorite.types.ts'
export * from './fridge.types.ts'
export * from './ingredient.types.ts'
export * from './measures.types.ts'
export * from './shoppingList.types.ts'
export * from './step.types.ts'
export * from './user.types.ts'
export * from './recipe.types.ts'
export * from './api.types.ts'
export * from './category.types.ts'

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe extends BaseEntity {
  title: string;
  description: string;
  photos: string[];
  image?: string; // Опциональное поле для основного изображения
  prepTime: number; // в секундах
  cookTime: number; // в секундах
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine?: KitchenType;
  kitchenIds?: string[];
  // Доп. поля для режима редактирования (serving)
  servingBaseUnit?: 'ML' | 'GR';
  servingTotalWeight?: number;
  servingRecipeUnit?: 'PORTION' | 'PLATE' | 'CUP' | 'PIECE' | 'SLICE' | 'ITEM' | 'GR' | 'ML';
  servingUnitCount?: number;
  tags: string[];
  ingredients: RecipeIngredientDto[];
  steps: StepResponseDto[];
  state?: StateDto;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  macros?: {
    calories: number;
    proteins: number;
    fats: number;
    carbs: number;
  };
  stats: {
    views: number;
    likes: number;
    saves: number;
    rating: number;
    reviewsCount: number;
  };
}

export interface RecipeFilters {
  search?: string;
  cuisine?: KitchenType[];
  difficulty?: DifficultyLevel[];
  cookTime?: {
    min?: number;
    max?: number;
  };
  prepTime?: {
    min?: number;
    max?: number;
  };
  servings?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  calories?: {
    min?: number;
    max?: number;
  };
}

export interface RecipeSort {
  field: 'createdAt' | 'prepTime' | 'cookTime' | 'rating';
  order: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
