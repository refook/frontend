import type { RecipeFilters, RecipeSort, DifficultyLevel } from '../types';

export type QuickFilterId =
  | 'sort-new'
  | 'sort-popular'
  | 'sort-trending'
  | 'time-15'
  | 'time-30'
  | 'calories-400'
  | 'calories-600'
  | 'difficulty-easy'
  | 'difficulty-medium'
  | 'difficulty-hard';

export type QuickFilterGroup = 'sort' | 'time' | 'calories' | 'difficulty';

export interface QuickFilter {
  id: QuickFilterId;
  label: string;
  group?: QuickFilterGroup;
  description?: string;
  apply: (state: { filters: RecipeFilters; sort: RecipeSort }) => { filters: RecipeFilters; sort: RecipeSort };
  remove: (state: { filters: RecipeFilters; sort: RecipeSort }) => { filters: RecipeFilters; sort: RecipeSort };
}

const ensureDifficulty = (level: DifficultyLevel | undefined, filters: RecipeFilters): RecipeFilters => {
  const next: RecipeFilters = { ...filters };
  if (level) {
    next.difficulty = [level];
  } else if (next.difficulty?.length) {
    delete next.difficulty;
  }
  next.level = level;
  return next;
};

const ensureCookTime = (maxMinutes: number | undefined, filters: RecipeFilters): RecipeFilters => {
  const next: RecipeFilters = { ...filters };
  if (typeof maxMinutes === 'number') {
    next.cookTime = { ...(next.cookTime || {}), max: maxMinutes };
  } else if (next.cookTime) {
    const incoming = { ...next.cookTime };
    delete incoming.max;
    if (incoming.min === undefined) {
      delete next.cookTime;
    } else {
      next.cookTime = incoming;
    }
  }
  return next;
};

const ensureCalories = (maxCalories: number | undefined, filters: RecipeFilters): RecipeFilters => {
  const next: RecipeFilters = { ...filters };
  if (typeof maxCalories === 'number') {
    next.calories = { ...(next.calories || {}), max: maxCalories };
  } else if (next.calories) {
    const incoming = { ...next.calories };
    delete incoming.max;
    if (incoming.min === undefined) {
      delete next.calories;
    } else {
      next.calories = incoming;
    }
  }
  return next;
};

export const QUICK_FILTERS: QuickFilter[] = [
  {
    id: 'sort-new',
    label: 'Новые',
    group: 'sort',
    description: 'Сначала недавно добавленные рецепты',
    apply: ({ filters, sort }) => ({
      filters: { ...filters },
      sort: { field: 'createdAt', order: 'desc' },
    }),
    remove: ({ filters, sort }) => ({
      filters: { ...filters },
      sort: { ...sort, field: 'createdAt', order: 'desc' },
    }),
  },
  {
    id: 'sort-popular',
    label: 'Популярные',
    group: 'sort',
    description: 'Рецепты с высоким рейтингом',
    apply: ({ filters, sort }) => ({
      filters: { ...filters },
      sort: { field: 'rating', order: 'desc' },
    }),
    remove: ({ filters, sort }) => ({
      filters: { ...filters },
      sort: { ...sort, field: 'createdAt', order: 'desc' },
    }),
  },
  {
    id: 'sort-trending',
    label: 'В тренде',
    group: 'sort',
    description: 'Популярные по просмотрам',
    apply: ({ filters, sort }) => ({
      filters: { ...filters },
      sort: { field: 'views', order: 'desc' },
    }),
    remove: ({ filters, sort }) => ({
      filters: { ...filters },
      sort: { ...sort, field: 'createdAt', order: 'desc' },
    }),
  },
  {
    id: 'time-15',
    label: '≤ 15 мин',
    group: 'time',
    description: 'Быстрые рецепты до 15 минут',
    apply: ({ filters, sort }) => ({
      filters: ensureCookTime(15, filters),
      sort,
    }),
    remove: ({ filters, sort }) => ({
      filters: ensureCookTime(undefined, filters),
      sort,
    }),
  },
  {
    id: 'time-30',
    label: '≤ 30 мин',
    group: 'time',
    description: 'Рецепты до 30 минут',
    apply: ({ filters, sort }) => ({
      filters: ensureCookTime(30, filters),
      sort,
    }),
    remove: ({ filters, sort }) => ({
      filters: ensureCookTime(undefined, filters),
      sort,
    }),
  },
  {
    id: 'calories-400',
    label: 'Низкокалорийные',
    group: 'calories',
    description: 'Не более 400 ккал',
    apply: ({ filters, sort }) => ({
      filters: ensureCalories(400, filters),
      sort,
    }),
    remove: ({ filters, sort }) => ({
      filters: ensureCalories(undefined, filters),
      sort,
    }),
  },
  {
    id: 'calories-600',
    label: 'Сытные',
    group: 'calories',
    description: 'Не более 600 ккал',
    apply: ({ filters, sort }) => ({
      filters: ensureCalories(600, filters),
      sort,
    }),
    remove: ({ filters, sort }) => ({
      filters: ensureCalories(undefined, filters),
      sort,
    }),
  },
  {
    id: 'difficulty-easy',
    label: 'Легко',
    group: 'difficulty',
    description: 'Уровень EASY',
    apply: ({ filters, sort }) => ({
      filters: ensureDifficulty('EASY', filters),
      sort,
    }),
    remove: ({ filters, sort }) => ({
      filters: ensureDifficulty(undefined, filters),
      sort,
    }),
  },
  {
    id: 'difficulty-medium',
    label: 'Средне',
    group: 'difficulty',
    description: 'Уровень MEDIUM',
    apply: ({ filters, sort }) => ({
      filters: ensureDifficulty('MEDIUM', filters),
      sort,
    }),
    remove: ({ filters, sort }) => ({
      filters: ensureDifficulty(undefined, filters),
      sort,
    }),
  },
  {
    id: 'difficulty-hard',
    label: 'Сложно',
    group: 'difficulty',
    description: 'Уровень HARD',
    apply: ({ filters, sort }) => ({
      filters: ensureDifficulty('HARD', filters),
      sort,
    }),
    remove: ({ filters, sort }) => ({
      filters: ensureDifficulty(undefined, filters),
      sort,
    }),
  },
];

export const DEFAULT_VISIBLE_QUICK_FILTERS: QuickFilterId[] = ['sort-new', 'time-15', 'calories-400'];

export const QUICK_FILTERS_MAP = new Map<QuickFilterId, QuickFilter>(QUICK_FILTERS.map((filter) => [filter.id, filter]));

export function computeSelection(
  selected: Set<QuickFilterId>,
  base: { filters: RecipeFilters; sort: RecipeSort }
) {
  let result = { filters: { ...base.filters }, sort: { ...base.sort } };
  for (const id of selected) {
    const quick = QUICK_FILTERS_MAP.get(id);
    if (!quick) continue;
    result = quick.apply(result);
  }
  return result;
}

export function toggleWithGroups(
  selected: Set<QuickFilterId>,
  target: QuickFilterId
) {
  const quick = QUICK_FILTERS_MAP.get(target);
  if (!quick) return new Set(selected);

  const next = new Set(selected);
  if (next.has(target)) {
    next.delete(target);
    return next;
  }

  if (quick.group) {
    for (const id of Array.from(next)) {
      const candidate = QUICK_FILTERS_MAP.get(id);
      if (candidate?.group === quick.group) {
        next.delete(id);
      }
    }
  }
  next.add(target);
  return next;
}
