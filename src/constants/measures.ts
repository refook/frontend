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

// Новые базовые единицы для продуктов (CreateProductDto.baseUnit)
export const BASE_UNITS = {
  GR: { value: 'GR', label: 'Граммы (GR)' },
  ML: { value: 'ML', label: 'Миллилитры (ML)' }
} as const;

export type BaseUnitType = typeof BASE_UNITS[keyof typeof BASE_UNITS]['value'];
export const BASE_UNITS_ARRAY = Object.values(BASE_UNITS);

// Новые продуктовые единицы (CreateProductDto.unit)
export const PRODUCT_UNITS = {
  GRAM: { value: 'GRAM', label: 'Грамм' },
  KILOGRAM: { value: 'KILOGRAM', label: 'Килограмм' },
  MILLIGRAM: { value: 'MILLIGRAM', label: 'Миллиграмм' },
  MILLILITER: { value: 'MILLILITER', label: 'Миллилитр' },
  LITER: { value: 'LITER', label: 'Литр' },
  TEASPOON: { value: 'TEASPOON', label: 'Чайная ложка' },
  TABLESPOON: { value: 'TABLESPOON', label: 'Столовая ложка' },
  CUP: { value: 'CUP', label: 'Стакан' },
  PIECE: { value: 'PIECE', label: 'Штука' },
  PACKAGE: { value: 'PACKAGE', label: 'Упаковка' },
  BUNCH: { value: 'BUNCH', label: 'Пучок' },
  SLICE: { value: 'SLICE', label: 'Ломтик' },
  LEAF: { value: 'LEAF', label: 'Лист' },
  PIECE_PART: { value: 'PIECE_PART', label: 'Часть' },
  PORTION: { value: 'PORTION', label: 'Порция' },
  PINCH: { value: 'PINCH', label: 'Щепотка' },
  HANDFUL: { value: 'HANDFUL', label: 'Горсть' },
  PLATE: { value: 'PLATE', label: 'Тарелка' },
  TO_TASTE: { value: 'TO_TASTE', label: 'По вкусу' },
  APPROX: { value: 'APPROX', label: 'Примерно' }
} as const;

export type ProductUnitType = typeof PRODUCT_UNITS[keyof typeof PRODUCT_UNITS]['value'];
export const PRODUCT_UNITS_ARRAY = Object.values(PRODUCT_UNITS);