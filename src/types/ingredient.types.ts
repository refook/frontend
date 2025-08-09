import type { MeasureType } from './measures.types';
import type {NutritionInfo} from "./common.types.ts";


export interface FormIngredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

// Ingredient types
export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  category: IngredientCategory;
  nutrition?: NutritionInfo;
  storageInstructions?: string;
  shelfLife?: number; // дни
}

export interface IngredientCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface ApiIngredient {
  id: string;
  name: string;
  description: string;
  measure: MeasureType;
  photoId?: string;
  ownerUser: {
    id: number;
    photo: string | null;
    username: string;
    name: string;
  };
  lastUpdater: {
    id: number;
    photo: string | null;
    username: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}