import type {BaseEntity, Ingredient, MeasureType} from "./index.ts";

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
  ingredientId: string;
  count: number;
  measure: MeasureType;
  expiryDate?: string; // ISO date string
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
  ingredientId: string;
  name: string;
  count: number;
  measure: MeasureType;
  expiryDate?: string; // ISO date string
  comment?: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
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