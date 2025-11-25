import { type GoalType } from './types';
import type { MealType } from '../../services/foodTrackerService';

export const macroColors = {
  proteins: '#55c891',
  fats: '#f7c266',
  carbs: '#9ca8ff',
} as const;

export const mealsLabels: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

export const goalMultipliers: Record<GoalType, number> = {
  maintenance: 1,
  weightGain: 1.1,
  muscleGain: 1.15,
  fatLoss: 0.85,
};

export const proteinPerKg: Record<GoalType, number> = {
  maintenance: 1.6,
  weightGain: 1.8,
  muscleGain: 2.0,
  fatLoss: 2.2,
};

export const fatPerKg: Record<GoalType, number> = {
  maintenance: 0.9,
  weightGain: 1.0,
  muscleGain: 1.0,
  fatLoss: 0.8,
};

export const unitLabels: Record<'portion' | 'gram' | 'piece', string> = {
  portion: 'порции',
  gram: 'г',
  piece: 'шт',
};
