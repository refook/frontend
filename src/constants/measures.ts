import type { MeasureType, MeasureInfo } from '../types/measures.types';

// Объект с метаданными для каждой единицы измерения
export const MEASURES: Record<MeasureType, MeasureInfo> = {
  ML: { value: 'ML', label: 'Миллилитры' },
  L: { value: 'L', label: 'Литры' },
  MG: { value: 'MG', label: 'Миллиграммы' },
  GR: { value: 'GR', label: 'Граммы' },
  KG: { value: 'KG', label: 'Килограммы' }
} as const;

// Массив для удобного использования в селектах
export const MEASURES_ARRAY = Object.values(MEASURES);