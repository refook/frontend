/**
 * Типы для единиц измерения.
 *
 * Назначение файла:
 * - Объявляет строгие типы для мер, используемых в продуктах/рецептах
 * - Не содержит UI-констант
 *
 * Использование:
 * - Импортируйте отсюда типы (например, BaseUnitType) для типизации DTO и пропсов
 */
// Определяем доступные единицы измерения
export type MeasureType = 'ML' | 'L' | 'MG' | 'GR' | 'KG';

// Новые базовые единицы (для продуктов/рецептов)
export type BaseUnitType = 'ML' | 'GR';

// Новые продуктовые/рецептурные единицы
export type ProductUnitType =
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

// Тип для метаданных единицы измерения
export interface MeasureInfo {
  value: MeasureType;
  label: string;
}