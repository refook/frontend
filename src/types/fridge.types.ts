import type {BaseEntity, Ingredient, MeasureType} from "./index.ts";
import type { BaseUnitType, ProductUnitType } from './measures.types';

// Fridge types
export interface FridgeItem extends BaseEntity {
  userId: string;
  ingredient: Ingredient;
  amount: number;
  unit: string;
  expirationDate?: string;
  purchaseDate?: string;
  location?: 'fridge' | 'freezer' | 'pantry';
  notes?: string;
}

export interface AddFridgeItemForm {
  ingredientId: string;
  amount: number;
  unit: string;
  expirationDate?: string;
  purchaseDate?: string;
  location?: FridgeItem['location'];
  notes?: string;
}

// DTO для создания продукта в холодильнике
export interface CreateFridgeProductDto {
  productId: string;
  baseUnit: BaseUnitType;
  avgWeight: number;
  productUnit: ProductUnitType;
  expiryDate?: string | null; // ISO date string or null
  comment?: string;
}

// DTO для обновления продукта в холодильнике
export interface UpdateFridgeProductDto {
  ingredientId?: string;
  count?: number;
  measure?: MeasureType;
  expiryDate?: string; // ISO date string
  comment?: string;
}

// DTO ответа API для продукта в холодильнике
export interface FridgeProductResponseDto {
  id: string;
  productId: string;
  name: string;
  baseUnit: 'ML' | 'GR';
  count: number;
  productUnit:
    | 'GRAM'
    | 'KILOGRAM'
    | 'MILLIGRAM'
    | 'MILLILITER'
    | 'LITER'
    | 'TEASPOON'
    | 'TABLESPOON'
    | 'CUP'
    | 'PIECE'
    | 'PACKAGE'
    | 'BUNCH'
    | 'SLICE'
    | 'LEAF'
    | 'PIECE_PART'
    | 'PORTION'
    | 'PINCH'
    | 'HANDFUL'
    | 'PLATE'
    | 'TO_TASTE'
    | 'APPROX';
  expiryDate?: string | null;
  comment?: string;
}

// Локальный тип для продукта в холодильнике (для UI)
export interface FridgeProduct {
  id: string;
  ingredient: {
    id: string;
    name: string;
    description?: string;
  };
  amount: number;
  unit: string;
  expiryDate?: Date;
  notes?: string;
  addedAt: Date;
  updatedAt: Date;
}

// ---------------- Fridges (контейнеры) ----------------

// DTO для создания холодильника
export interface CreateFridgeDto {
  name: string;
  description?: string;
  address?: string;
}

// DTO ответа API для холодильника
export interface FridgeResponseDto {
  id: string;
  name: string;
  description?: string;
  address?: string;
  ownerId?: string | number;
  createdAt?: string;
  updatedAt?: string;
}