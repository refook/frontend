import type { RecipeFilters } from '../types';

/**
 * Маппер AI‑фильтров в формат стора
 *
 * Назначение: преобразовать ответ ИИ (RecipeFilterResponseDto‑like) в структуру
 * `RecipeFilters`, не изменяя структуру стора в остальных местах.
 *
 * Поддерживаемые поля:
 * - name → filters.search
 * - min/maxCalories → filters.calories.min/max
 * - maxTime (сек) → filters.cookTime.max (мин)
 * - level (EASY|MEDIUM|HARD) → filters.difficulty[0]
 * - min/maxUnitCount → filters.servings.min/max
 */

interface AiFilterResponseLike {
  name?: string | null;
  maxCalories?: number | null;
  minCalories?: number | null;
  maxTime?: number | null; // секунды
  level?: string | null; // 'EASY' | 'MEDIUM' | 'HARD'
  maxTotalWeight?: number | null;
  minTotalWeight?: number | null;
  maxUnitCount?: number | null;
  minUnitCount?: number | null;
  recipeUnitType?: string | null;
  tags?: unknown;
  kitchens?: unknown;
  products?: unknown;
  sortField?: string | null;
  sortDirection?: string | null;
}

function toNumberOrUndefined(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function clampNonNegative(n: number | undefined): number | undefined {
  if (typeof n !== 'number') return undefined;
  return Math.max(0, n);
}

export function mergeAiFilterIntoFilters(ai: AiFilterResponseLike | null | undefined, base: RecipeFilters): RecipeFilters {
  if (!ai || typeof ai !== 'object') return { ...base };

  const next: RecipeFilters = { ...base };

  // name → search
  if (ai.name && typeof ai.name === 'string') {
    next.search = ai.name;
  }

  // calories
  const minCal = clampNonNegative(toNumberOrUndefined(ai.minCalories));
  const maxCal = clampNonNegative(toNumberOrUndefined(ai.maxCalories));
  if (typeof minCal === 'number' || typeof maxCal === 'number') {
    next.calories = { ...(next.calories || {}) };
    if (typeof minCal === 'number') next.calories.min = minCal;
    if (typeof maxCal === 'number') next.calories.max = maxCal;
  }

  // cookTime: секунды → минуты
  const maxTimeSec = toNumberOrUndefined(ai.maxTime);
  if (typeof maxTimeSec === 'number') {
    const maxMinutes = Math.max(0, maxTimeSec / 60);
    next.cookTime = { ...(next.cookTime || {}), max: maxMinutes };
  }

  // difficulty level
  if (ai.level) {
    const up = String(ai.level).toUpperCase();
    if (up === 'EASY' || up === 'MEDIUM' || up === 'HARD') {
      next.difficulty = [up as any];
      next.level = up as any;
    }
  }

  // servings (unitCount)
  const minUnits = clampNonNegative(toNumberOrUndefined(ai.minUnitCount));
  const maxUnits = clampNonNegative(toNumberOrUndefined(ai.maxUnitCount));
  if (typeof minUnits === 'number' || typeof maxUnits === 'number') {
    next.servings = { ...(next.servings || {}) };
    if (typeof minUnits === 'number') next.servings.min = minUnits;
    if (typeof maxUnits === 'number') next.servings.max = maxUnits;
    if (typeof minUnits === 'number') next.minUnitCount = minUnits;
    else delete next.minUnitCount;
    if (typeof maxUnits === 'number') next.maxUnitCount = maxUnits;
    else delete next.maxUnitCount;
  }

  // total weight (grams/ml)
  const minWeight = clampNonNegative(toNumberOrUndefined(ai.minTotalWeight));
  const maxWeight = clampNonNegative(toNumberOrUndefined(ai.maxTotalWeight));
  if (typeof minWeight === 'number' || typeof maxWeight === 'number') {
    next.totalWeight = { ...(next.totalWeight || {}) };
    if (typeof minWeight === 'number') next.totalWeight.min = minWeight;
    if (typeof maxWeight === 'number') next.totalWeight.max = maxWeight;
    if (typeof minWeight === 'number') next.minTotalWeight = minWeight;
    else delete next.minTotalWeight;
    if (typeof maxWeight === 'number') next.maxTotalWeight = maxWeight;
    else delete next.maxTotalWeight;
  }

  // recipe unit type
  if (ai.recipeUnitType && typeof ai.recipeUnitType === 'string') {
    const unit = ai.recipeUnitType.toUpperCase();
    const allowed = ['PORTION', 'PLATE', 'CUP', 'PIECE', 'SLICE', 'ITEM'];
    if (allowed.includes(unit)) {
      next.recipeUnit = unit as any;
    }
  }

  // tags → массив строковых названий тегов (или id, если имени нет)
  const rawTags = (ai as any)?.tags;
  if (Array.isArray(rawTags)) {
    const mappedTags = rawTags
      .map((t: any) => {
        if (t && typeof t === 'object') {
          if (typeof t.name === 'string' && t.name.trim().length > 0) return t.name.trim();
          if (typeof t.id === 'string' && t.id.trim().length > 0) return t.id.trim();
        }
        if (typeof t === 'string' && t.trim().length > 0) return t.trim();
        return undefined;
      })
      .filter((s: any): s is string => typeof s === 'string');
    if (mappedTags.length > 0) {
      next.tags = mappedTags;
    }

    const mappedIds = rawTags
      .map((t: any) => (t && typeof t === 'object' && typeof t.id === 'string' ? t.id : undefined))
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0);
    if (mappedIds.length > 0) {
      next.tagIds = mappedIds;
    }
  }

  const rawKitchens = (ai as any)?.kitchens;
  if (Array.isArray(rawKitchens)) {
    const kitchenIds = rawKitchens
      .map((k: any) => {
        if (k && typeof k === 'object') {
          if (typeof k.id === 'string') return k.id;
        }
        if (typeof k === 'string') return k;
        return undefined;
      })
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0);
    if (kitchenIds.length > 0) {
      next.kitchenIds = kitchenIds;
    }
  }

  const rawProducts = (ai as any)?.products;
  if (Array.isArray(rawProducts)) {
    const productIds = rawProducts
      .map((p: any) => {
        if (p && typeof p === 'object') {
          if (typeof p.id === 'string') return p.id;
        }
        if (typeof p === 'string') return p;
        return undefined;
      })
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0);
    if (productIds.length > 0) {
      next.productIds = productIds;
    }
  }

  return next;
}
