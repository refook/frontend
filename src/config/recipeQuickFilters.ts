import type { RecipeFilters, RecipeSort, DifficultyLevel, KitchenType } from '../types';

export type QuickFilterId = never;

export type QuickFilterGroup = never;

export interface QuickFilter {}

export const DEFAULT_VISIBLE_QUICK_FILTERS: QuickFilterId[] = [];

export const QUICK_FILTERS: QuickFilter[] = [];

export function computeSelection(
  selected: Set<QuickFilterId>,
  base: { filters: RecipeFilters; sort: RecipeSort }
) {
  return { filters: { ...base.filters }, sort: { ...base.sort } };
}

export function toggleWithGroups(
  selected: Set<QuickFilterId>,
  target: QuickFilterId
) {
  return new Set(selected);
}


