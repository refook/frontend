export type ModalTab = 'product' | 'recipe' | 'manual';
export type PortionUnit = 'portion' | 'gram' | 'piece';
export type Sex = 'male' | 'female';
export type GoalType = 'maintenance' | 'fatLoss' | 'weightGain' | 'muscleGain';

export interface GoalInputs {
  weight: number;
  height: number;
  age: number;
  sex: Sex;
  target: GoalType;
}

export interface GoalResult {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}
