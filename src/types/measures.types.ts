// Определяем доступные единицы измерения
export type MeasureType = 'ML' | 'L' | 'MG' | 'GR' | 'KG';

// Тип для метаданных единицы измерения
export interface MeasureInfo {
  value: MeasureType;
  label: string;
}