import type { RecipeFilters, RecipeSort, DifficultyLevel, KitchenType } from '../types';

export type QuickFilterId =
  | 'popular'
  | 'new'
  | 'time15'
  | 'time30'
  | 'time60'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'serv2'
  | 'serv4'
  | 'rus'
  | 'asian'
  | 'vegetarian'
  | 'vegan'
  | 'glutenFree';

export type QuickFilterGroup = 'sort' | 'time' | 'difficulty' | 'servings' | 'cuisine' | 'tags';

export interface QuickFilter {
  id: QuickFilterId;
  label: string;
  group: QuickFilterGroup;
  apply: (base: { filters: RecipeFilters; sort: RecipeSort }) => {
    filters: RecipeFilters;
    sort: RecipeSort;
  };
}

export const DEFAULT_VISIBLE_QUICK_FILTERS: QuickFilterId[] = [
  'popular', 'time30', 'easy', 'new'
];

export const QUICK_FILTERS: QuickFilter[] = [
  {
    id: 'popular',
    label: 'Популярность',
    group: 'sort',
    apply: ({ filters, sort }) => ({
      filters,
      sort: { field: 'rating', order: 'desc' },
    }),
  },
  {
    id: 'new',
    label: 'Новые',
    group: 'sort',
    apply: ({ filters, sort }) => ({
      filters,
      sort: { field: 'createdAt', order: 'desc' },
    }),
  },
  {
    id: 'time15',
    label: 'До 15 мин',
    group: 'time',
    apply: ({ filters, sort }) => {
      const prevMax = filters.cookTime?.max ?? Number.POSITIVE_INFINITY;
      const max = Math.min(prevMax, 15);
      return { filters: { ...filters, cookTime: { ...filters.cookTime, max } }, sort };
    },
  },
  {
    id: 'time30',
    label: 'До 30 мин',
    group: 'time',
    apply: ({ filters, sort }) => {
      const prevMax = filters.cookTime?.max ?? Number.POSITIVE_INFINITY;
      const max = Math.min(prevMax, 30);
      return { filters: { ...filters, cookTime: { ...filters.cookTime, max } }, sort };
    },
  },
  {
    id: 'time60',
    label: 'До 60 мин',
    group: 'time',
    apply: ({ filters, sort }) => {
      const prevMax = filters.cookTime?.max ?? Number.POSITIVE_INFINITY;
      const max = Math.min(prevMax, 60);
      return { filters: { ...filters, cookTime: { ...filters.cookTime, max } }, sort };
    },
  },
  {
    id: 'easy',
    label: 'Легкие',
    group: 'difficulty',
    apply: ({ filters, sort }) => {
      const list = new Set<DifficultyLevel>([...(filters.difficulty ?? []), 'EASY']);
      return { filters: { ...filters, difficulty: Array.from(list) }, sort };
    },
  },
  {
    id: 'medium',
    label: 'Средние',
    group: 'difficulty',
    apply: ({ filters, sort }) => {
      const list = new Set<DifficultyLevel>([...(filters.difficulty ?? []), 'MEDIUM']);
      return { filters: { ...filters, difficulty: Array.from(list) }, sort };
    },
  },
  {
    id: 'hard',
    label: 'Сложные',
    group: 'difficulty',
    apply: ({ filters, sort }) => {
      const list = new Set<DifficultyLevel>([...(filters.difficulty ?? []), 'HARD']);
      return { filters: { ...filters, difficulty: Array.from(list) }, sort };
    },
  },
  {
    id: 'serv2',
    label: '2 порции',
    group: 'servings',
    apply: ({ filters, sort }) => {
      const min = Math.max(filters.servings?.min ?? 0, 2);
      return { filters: { ...filters, servings: { ...filters.servings, min } }, sort };
    },
  },
  {
    id: 'serv4',
    label: '4 порции',
    group: 'servings',
    apply: ({ filters, sort }) => {
      const min = Math.max(filters.servings?.min ?? 0, 4);
      return { filters: { ...filters, servings: { ...filters.servings, min } }, sort };
    },
  },
  {
    id: 'rus',
    label: 'Русская кухня',
    group: 'cuisine',
    apply: ({ filters, sort }) => {
      const set = new Set<KitchenType>([...(filters.cuisine ?? []), 'RUSSIAN']);
      return { filters: { ...filters, cuisine: Array.from(set) }, sort };
    },
  },
  {
    id: 'asian',
    label: 'Азиатская',
    group: 'cuisine',
    apply: ({ filters, sort }) => {
      const set = new Set<KitchenType>([...(filters.cuisine ?? []), 'ASIAN']);
      return { filters: { ...filters, cuisine: Array.from(set) }, sort };
    },
  },
  {
    id: 'vegetarian',
    label: 'Вегетарианские',
    group: 'tags',
    apply: ({ filters, sort }) => {
      const set = new Set<string>([...(filters.tags ?? []), 'vegetarian']);
      return { filters: { ...filters, tags: Array.from(set) }, sort };
    },
  },
  {
    id: 'vegan',
    label: 'Веган',
    group: 'tags',
    apply: ({ filters, sort }) => {
      const set = new Set<string>([...(filters.tags ?? []), 'vegan']);
      return { filters: { ...filters, tags: Array.from(set) }, sort };
    },
  },
  {
    id: 'glutenFree',
    label: 'Без глютена',
    group: 'tags',
    apply: ({ filters, sort }) => {
      const set = new Set<string>([...(filters.tags ?? []), 'gluten-free']);
      return { filters: { ...filters, tags: Array.from(set) }, sort };
    },
  },
];

export function computeSelection(
  selected: Set<QuickFilterId>,
  base: { filters: RecipeFilters; sort: RecipeSort }
) {
  // Применяем по порядку; для группы 'sort' последняя побеждает
  let acc = { filters: { ...base.filters }, sort: { ...base.sort } };
  for (const f of QUICK_FILTERS) {
    if (selected.has(f.id)) {
      acc = f.apply(acc);
    }
  }
  return acc;
}

export function toggleWithGroups(
  selected: Set<QuickFilterId>,
  target: QuickFilterId
) {
  const next = new Set(selected);
  const targetFilter = QUICK_FILTERS.find((f) => f.id === target);
  if (!targetFilter) return next;
  if (next.has(target)) {
    next.delete(target);
    return next;
  }
  // единственность для группы sort
  if (targetFilter.group === 'sort') {
    for (const f of QUICK_FILTERS) {
      if (f.group === 'sort') next.delete(f.id);
    }
  }
  next.add(target);
  return next;
}


