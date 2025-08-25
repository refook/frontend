import type {FormIngredient, FormStep, Ingredient, Recipe} from "./index.ts";
import type { BaseUnitType, ProductUnitType } from './measures.types';

export type KitchenType = 'RUSSIAN' | 'ASIAN';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface TagResponseDto {
  id: string;
  name: string;
}


export interface RecipeIngredient {
  id: string;
  ingredient: Ingredient;
  amount: number;
  unit: string;
  notes?: string;
  optional?: boolean;
}

// Form types
export interface CreateRecipeForm {
  title: string;
  description: string;
  image?: File;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: Recipe['difficulty'];
  cuisine?: string;
  tags: string[];
  ingredients: FormIngredient[];
  steps: FormStep[];
}
// DTO для создания рецепта
export interface CreateRecipeDto {
  name: string;
  description: string;
  kitchens?: string[];
  level: DifficultyLevel;
  cookTime: number; // секунды
  allTime: number; // секунды
  photos?: string[];
  tags?: TagResponseDto[] | null;
  ingredients: CreateRecipeIngredientDto[];
  steps: CreateStepDto[];
  baseUnit?: BaseUnitType;
  avgWeight?: number;
  unit?: ProductUnitType;
  macros?: {
    calories: number;
    proteins: number;
    fats: number;
    carbs: number;
  };
}

// DTO для обновления рецепта (тот же формат, что и создание)
export interface UpdateStepDto extends CreateStepDto {
  id?: string;
}

export interface UpdateRecipeDto {
  name: string;
  description: string;
  kitchens?: string[];
  level: DifficultyLevel;
  cookTime: number;
  allTime: number;
  photos?: string[];
  tags?: TagResponseDto[] | null;
  ingredients: CreateRecipeIngredientDto[];
  steps: UpdateStepDto[];
}

// DTO для создания ингредиента в рецепте
export interface CreateRecipeIngredientDto {
  id: string;
  count: number;
  productUnit: ProductUnitType;
}

// DTO для создания шага
export interface CreateStepDto {
  index: number;
  name?: string;
  description: string;
  photos?: string[];
  ingredients?: CreateRecipeIngredientDto[];
  time?: number;
}

// DTO для ответа от API
export interface RecipeResponseDto {
  id: string;
  name: string;
  description: string;
  kitchen?: KitchenType;
  level: DifficultyLevel;
  steps: StepResponseDto[];
  photos: string[];
  tags: string[] | null;
  ingredients: RecipeIngredientDto[];
  cookTime: number;
  allTime: number;
  portion: number;
  ownerUser: UserInfoResponseDto;
  lastUpdaterId: number;
  createdAt: string;
  updatedAt: string;
}

// DTO для шага в ответе
export interface StepResponseDto {
  id: string;
  index: number;
  name?: string;
  description: string;
  photos: string[];
  ingredients: RecipeIngredientDto[];
  time?: number;
}

// DTO для ингредиента в ответе
export interface RecipeIngredientDto {
  id: string;
  name: string;
  description?: string;
  count: number;
  productUnit?: ProductUnitType;
}

// DTO для информации о пользователе
export interface UserInfoResponseDto {
  id: number;
  photo: string | null;
  username: string;
  name: string;
}