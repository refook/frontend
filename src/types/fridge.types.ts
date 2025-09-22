import type { BaseEntity, Ingredient, MeasureType } from './index.ts';
import type { ProductMeasureResponseDto } from './api.types';

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
  isVariant: boolean;
  count: number;
  measureId: string;
  expiryDate?: string | null;
  comment?: string;
}

// DTO для обновления продукта в холодильнике
export interface UpdateFridgeProductDto {
  productId: string;
  isVariant: boolean;
  count: number;
  measureId: string;
  expiryDate?: string | null;
  comment?: string;
}

// DTO ответа API для продукта в холодильнике
export interface FridgeProductResponseDto {
  id: string;
  productId: string;
  name: string;
  isVariant: boolean;
  count: number;
  measure: ProductMeasureResponseDto;
  expiryDate?: string | null;
  comment?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Локальный тип для продукта в холодильнике (для UI)
export interface FridgeProduct {
  id: string;
  productId: string;
  ingredient: {
    id: string;
    name: string;
    description?: string;
  };
  isVariant: boolean;
  count: number;
  measure: ProductMeasureResponseDto;
  /**
   * Количество продукта в базовых единицах (граммы/мл) для обратной совместимости.
   * Для большинства мер рассчитывается как count * measure.weight.
   */
  amount: number;
  /**
   * Условная единица измерения для обратной совместимости со старым UI.
   */
  unit: string;
  /**
   * Базовая единица (если доступна) для обратной совместимости.
   */
  baseUnit?: 'GR' | 'ML';
  expiryDate?: Date;
  comment?: string;
  /**
   * Дублирует comment для старого UI.
   */
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
