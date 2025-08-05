import type { MeasureType } from './measures.types';

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

export interface CreateRecipeIngredientDto {
  id: string;
  count: number;
  measure: MeasureType;
}