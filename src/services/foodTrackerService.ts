import type { Recipe, ProductResponseDto } from '../types';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type TrackerEntrySource = 'product' | 'recipe' | 'manual';

export interface TrackerEntry {
  id: string;
  title: string;
  calories: number;
  source: TrackerEntrySource;
  macros?: {
    proteins?: number;
    fats?: number;
    carbs?: number;
  };
  details?: string;
}

export type DayMeals = Record<MealType, TrackerEntry[]>;

const defaultMeals: DayMeals = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snack: [],
};

const inMemoryStore = new Map<string, DayMeals>();

const cloneMeals = (meals: DayMeals): DayMeals => ({
  breakfast: [...meals.breakfast],
  lunch: [...meals.lunch],
  dinner: [...meals.dinner],
  snack: [...meals.snack],
});

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `entry-${Math.random().toString(16).slice(2)}`;
};

export const foodTrackerService = {
  getDay(dateKey: string): DayMeals {
    if (!inMemoryStore.has(dateKey)) {
      inMemoryStore.set(dateKey, cloneMeals(defaultMeals));
    }
    return cloneMeals(inMemoryStore.get(dateKey)!);
  },

  addEntry(
    dateKey: string,
    meal: MealType,
    entry: Omit<TrackerEntry, 'id'>
  ): DayMeals {
    const current = this.getDay(dateKey);
    const newEntry: TrackerEntry = { id: generateId(), ...entry };
    current[meal] = [...current[meal], newEntry];
    inMemoryStore.set(dateKey, current);
    return this.getDay(dateKey);
  },

  removeEntry(dateKey: string, meal: MealType, entryId: string): DayMeals {
    const current = this.getDay(dateKey);
    current[meal] = current[meal].filter((item) => item.id !== entryId);
    inMemoryStore.set(dateKey, current);
    return this.getDay(dateKey);
  },

  productToEntry(
    product: ProductResponseDto,
    options?: { factor?: number; details?: string }
  ): Omit<TrackerEntry, 'id'> {
    const factor = options?.factor ?? 1;
    return {
      title: product.name,
      calories: Number(product.macros?.calories ?? 0) * factor,
      source: 'product',
      details: options?.details,
      macros: {
        proteins: product.macros?.proteins
          ? product.macros.proteins * factor
          : undefined,
        fats: product.macros?.fats ? product.macros.fats * factor : undefined,
        carbs: product.macros?.carbs ? product.macros.carbs * factor : undefined,
      },
    };
  },

  recipeToEntry(
    recipe: Recipe,
    options?: { factor?: number; details?: string }
  ): Omit<TrackerEntry, 'id'> {
    const factor = options?.factor ?? 1;
    return {
      title: recipe.title,
      calories: Number(recipe.macros?.calories ?? 0) * factor,
      source: 'recipe',
      details: options?.details,
      macros: {
        proteins: recipe.macros?.proteins
          ? recipe.macros.proteins * factor
          : undefined,
        fats: recipe.macros?.fats ? recipe.macros.fats * factor : undefined,
        carbs: recipe.macros?.carbs ? recipe.macros.carbs * factor : undefined,
      },
    };
  },
};
