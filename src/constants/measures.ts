/**
 * Константы и опции для единиц измерения (UI-слой).
 *
 * Назначение файла:
 * - Экспортирует словари и массивы опций для селектов/контролов UI
 * - Не объявляет типы (типизацию см. в src/types/measures.types.ts)
 *
 * Использование:
 * - Импортируйте отсюда массивы вида *_ARRAY для рендера списков опций
 */
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

export const PRODUCT_UNITS_ARRAY = Object.values(PRODUCT_UNITS);

// Единицы для итогового продукта рецепта (recipeUnit)
export const RECIPE_UNITS = {
  PORTION: { value: 'PORTION', label: 'Порция' },
  PLATE: { value: 'PLATE', label: 'Тарелка' },
  CUP: { value: 'CUP', label: 'Стакан' },
  PIECE: { value: 'PIECE', label: 'Штука' },
  SLICE: { value: 'SLICE', label: 'Ломтик' },
  ITEM: { value: 'ITEM', label: 'Предмет' },
  GR: { value: 'GR', label: 'Грамм' },
  ML: { value: 'ML', label: 'Миллилитр' }
} as const;

export const RECIPE_UNITS_ARRAY = Object.values(RECIPE_UNITS);