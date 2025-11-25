import { fatPerKg, goalMultipliers, proteinPerKg } from './constants';
import type { GoalInputs, GoalResult } from './types';

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);

export const calculateGoalFromInputs = ({ weight, height, age, sex, target }: GoalInputs): GoalResult => {
  const safeWeight = Math.max(weight, 1);
  const safeHeight = Math.max(height, 80);
  const safeAge = Math.max(age, 14);

  const bmr = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + (sex === 'male' ? 5 : -161);
  const tdee = bmr * 1.2;

  const calories = Math.round(Math.max(1200, tdee * goalMultipliers[target]));
  const proteins = Math.round(proteinPerKg[target] * safeWeight);
  const fats = Math.round(fatPerKg[target] * safeWeight);
  const carbs = Math.max(
    0,
    Math.round((calories - proteins * 4 - fats * 9) / 4)
  );

  return { calories, proteins, fats, carbs };
};
