import type {FormIngredient, FormStep, Ingredient, MeasureType, Recipe} from "./index.ts";

export type KitchenType = 'RUSSIAN' | 'ASIAN';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';


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
  kitchen?: KitchenType;
  level: DifficultyLevel;
  cookTime: number;
  allTime: number;
  portion: number;
  photos?: string[];
  tags?: string[] | null;
  ingredients: CreateRecipeIngredientDto[];
  steps: CreateStepDto[];
}

// DTO для создания ингредиента в рецепте
export interface CreateRecipeIngredientDto {
  id: string;
  count: number;
  measure: MeasureType;
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
  measure: MeasureType;
}

// DTO для информации о пользователе
export interface UserInfoResponseDto {
  id: number;
  photo: string | null;
  username: string;
  name: string;
}