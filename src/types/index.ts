import type { KitchenType, DifficultyLevel, RecipeIngredientDto, StepResponseDto } from './recipe.types';

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
  tags: string[];
  ingredients: RecipeIngredientDto[];
  steps: StepResponseDto[];
  author: {
    id: string;
    name: string;
    avatar?: string;
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