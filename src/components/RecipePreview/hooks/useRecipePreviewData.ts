import { useCallback, useMemo } from 'react';
import type { Recipe } from '../../../types';
import type {
  ApiCreateRecipeDto,
  ApiUpdateRecipeDto,
  ApiUpdateRecipeIngredientDto,
  ApiUpdateStepDto,
  CreateRecipeDto,
  CreateRecipeIngredientDto,
  CreateStepDto,
  RecipeIngredientDto,
  StepResponseDto,
} from '../../../types/recipe.types';
import { useMeasureLabels } from '../../../hooks/useMeasureLabels';
import { useAvailableIngredients } from '../../../hooks/useAvailableIngredients';
import { resolveIngredientIdentifiers } from '../../../utils/recipeIngredient';
import { formatMeasureLabel } from '../../../utils/measureLabel';
import type {
  AggregatedIngredients,
  FormRecipeData,
  NormalizedIngredient,
  RecipePreviewDataSources,
} from '../RecipePreview.types';
import { getRecipeStatsSnapshot, isBadgeResponse } from '../RecipePreview.utils';
import type { BadgeResponseDto } from '../../../types';

const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const useRecipePreviewSources = (
  formData?: FormRecipeData,
  recipe?: Recipe,
): RecipePreviewDataSources => {
  const isFormData = !recipe;
  const formRecipeData = isFormData ? formData : undefined;
  const apiFormData = isFormData && formRecipeData && 'composition' in formRecipeData
    ? (formRecipeData as ApiCreateRecipeDto | ApiUpdateRecipeDto)
    : undefined;
  const legacyFormData =
    isFormData && formRecipeData && !apiFormData ? (formRecipeData as CreateRecipeDto) : undefined;
  const recipeData = !isFormData ? (recipe as Recipe | undefined) : undefined;
  const hasData = Boolean(formRecipeData || recipeData);

  return {
    isFormData,
    formRecipeData,
    apiFormData,
    legacyFormData,
    recipeData,
    hasData,
  };
};

type UseRecipePreviewDataResult = {
  sources: RecipePreviewDataSources;
  steps: Array<ApiUpdateStepDto | CreateStepDto | StepResponseDto>;
  normalizedIngredients: NormalizedIngredient[];
  measureLabels: Record<string, string>;
  getIngredientName: (id: string) => string | undefined;
  tags: string[];
  categories: string[];
  kitchens: string[];
  recipeStats: ReturnType<typeof getRecipeStatsSnapshot>;
  badges: BadgeResponseDto[];
  macros:
    | {
        calories: number;
        proteins: number;
        fats: number;
        carbs: number;
      }
    | null
    | undefined;
};

/**
 * Агрегирует все данные, необходимые для отображения превью рецепта.
 * @desc Определяет источник данных (форма/готовый рецепт), объединяет ингредиенты из composition и шагов,
 * нормализует теги/категории/бейджи и возвращает уже подготовленные структуры для UI.
 * @note Все вычисления (тайминги, статистика, подписи к мерам и др.) вынесены сюда,
 * чтобы подкомпоненты оставались максимально тонкими и не обращались к API напрямую.
 */
export const useRecipePreviewData = (
  formData?: FormRecipeData,
  recipe?: Recipe,
): UseRecipePreviewDataResult => {
  const sources = useRecipePreviewSources(formData, recipe);
  const { isFormData, apiFormData, legacyFormData, recipeData } = sources;

  const ingredientsSource = useMemo(() => {
    if (apiFormData) return apiFormData.composition?.ingredients ?? [];
    if (legacyFormData) return legacyFormData.ingredients ?? [];
    return recipeData?.ingredients ?? [];
  }, [apiFormData, legacyFormData, recipeData]);

  const stepsSource = useMemo(() => {
    if (apiFormData) return apiFormData.composition?.steps ?? [];
    if (legacyFormData) return legacyFormData.steps ?? [];
    return recipeData?.steps ?? [];
  }, [apiFormData, legacyFormData, recipeData]);

  const aggregatedIngredients = useMemo<AggregatedIngredients>(() => {
    const composition = Array.isArray(ingredientsSource)
      ? (ingredientsSource as AggregatedIngredients)
      : [];
    const stepItems = Array.isArray(stepsSource)
      ? (stepsSource as Array<ApiUpdateStepDto | CreateStepDto | StepResponseDto>).flatMap(
          (step) => ((step as any)?.ingredients ?? []) as AggregatedIngredients,
        )
      : [];
    return [...composition, ...stepItems];
  }, [ingredientsSource, stepsSource]);

  const variantNames = useMemo(() => {
    const map: Record<string, string> = {};
    aggregatedIngredients.forEach((item: any) => {
      const meta = resolveIngredientIdentifiers(item);
      const variantId = meta.variantId;
      if (!variantId || map[variantId]) return;
      const name = item?.variantName || item?.variant?.name || item?.name;
      if (typeof name === 'string' && name.trim().length > 0) {
        map[variantId] = name.trim();
      }
    });
    return map;
  }, [aggregatedIngredients]);

  const formMeasureLabels = useMeasureLabels(isFormData ? aggregatedIngredients : []);

  const recipeMeasureLabels = useMemo(() => {
    if (isFormData) return {} as Record<string, string>;
    const map: Record<string, string> = {};
    aggregatedIngredients.forEach((ingredient: any) => {
      const measureId = ingredient?.productMeasureId;
      if (!measureId || map[measureId]) return;
      const measureName = ingredient?.measure?.name ?? ingredient?.measureName;
      if (typeof measureName === 'string' && measureName.trim().length > 0) {
        map[measureId] = measureName.trim();
      }
    });
    return map;
  }, [aggregatedIngredients, isFormData]);

  const measureLabels = isFormData ? formMeasureLabels : recipeMeasureLabels;

  const { ingredients: availableIngredients } = useAvailableIngredients(isFormData);

  const steps = useMemo(() => {
    return [...(stepsSource as Array<ApiUpdateStepDto | CreateStepDto | StepResponseDto>)].sort(
      (a: any, b: any) => Number(a?.index || 0) - Number(b?.index || 0),
    );
  }, [stepsSource]);

  const normalizedIngredients = useMemo<NormalizedIngredient[]>(() => {
    return (ingredientsSource as any[]).map((ingredient: any) => {
      if (apiFormData) {
        const ing = ingredient as ApiUpdateRecipeIngredientDto;
        const meta = resolveIngredientIdentifiers(ing);
        const baseIngredient = availableIngredients.find(
          (i) => i.id === (meta.baseProductId || ing.id),
        );
        const resolvedVariantName = meta.variantId ? variantNames[meta.variantId] : undefined;
        const name = resolvedVariantName || baseIngredient?.name || 'Ингредиент';
        const measureId = ing.productMeasureId;
        const measureLabel = measureId ? measureLabels[measureId] : undefined;
        const unitLabel = formatMeasureLabel(measureLabel ? String(measureLabel) : undefined);
        const suffix = unitLabel ? ` ${unitLabel}` : '';
        return {
          id: `form-new:${meta.variantId || meta.baseProductId || ing.id}:${measureId ?? 'none'}:${ing.count}`,
          name,
          amount: `${ing.count}${suffix}`,
        };
      }

      if (legacyFormData) {
        const ing = ingredient as CreateRecipeIngredientDto;
        const meta = resolveIngredientIdentifiers(ing);
        const baseIngredient = availableIngredients.find(
          (i) => i.id === (meta.baseProductId || ing.id),
        );
        const resolvedVariantName = meta.variantId ? variantNames[meta.variantId] : undefined;
        const name = resolvedVariantName || baseIngredient?.name || 'Ингредиент';
        const unitRaw = (ing as any).productUnit || (ing as any).measure || '';
        const unit = formatMeasureLabel(unitRaw ? String(unitRaw) : undefined);
        const suffix = unit ? ` ${unit}` : '';
        return {
          id: `form:${meta.variantId || meta.baseProductId || ing.id}:${unitRaw}:${ing.count}`,
          name,
          amount: `${ing.count}${suffix}`,
        };
      }

      const ing = ingredient as RecipeIngredientDto;
      const meta = resolveIngredientIdentifiers(ing);
      const resolvedVariantName = meta.variantId ? variantNames[meta.variantId] : undefined;
      const name = resolvedVariantName || ing.name || 'Ингредиент';
      const measureNameFromApi = (ing as any)?.measure?.name as string | undefined;
      const measureId = (ing as any)?.productMeasureId as string | undefined;
      const measureLabelFromCache = measureId ? measureLabels[measureId] : undefined;
      const fallbackUnit = (ing as any).productUnit || (ing as any).measure || '';
      const unitLabelRaw = measureNameFromApi || measureLabelFromCache || fallbackUnit;
      const unitLabel = formatMeasureLabel(unitLabelRaw ? String(unitLabelRaw) : undefined);
      const unitSuffix = unitLabel ? ` ${unitLabel}` : '';
      return {
        id: `api:${meta.variantId || meta.baseProductId || ing.id}`,
        name,
        amount: `${ing.count}${unitSuffix}`,
      };
    });
  }, [
    apiFormData,
    legacyFormData,
    ingredientsSource,
    availableIngredients,
    variantNames,
    measureLabels,
  ]);

  const getIngredientName = useCallback(
    (id: string) =>
      variantNames[id] || availableIngredients.find((item) => item.id === id)?.name,
    [availableIngredients, variantNames],
  );

  const tags = useMemo(() => {
    if (apiFormData) {
      const rawTags = apiFormData.metaInfo?.tags ?? [];
      return (rawTags || []).map((t) => String(t)).filter(Boolean);
    }
    if (legacyFormData) {
      return ((legacyFormData.tags ?? []) as any[])
        .map((t: any) => (typeof t === 'string' ? t : t?.name ?? ''))
        .filter(Boolean);
    }
    const recipeTags = ((recipeData as any)?.tags ?? []) as any[];
    return recipeTags
      .map((t: any) => (typeof t === 'string' ? t : t?.name ?? ''))
      .filter(Boolean) as string[];
  }, [apiFormData, legacyFormData, recipeData]);

  const categories = useMemo(() => {
    if (apiFormData) {
      const raw = (apiFormData as any)?.metaInfo?.categories ?? [];
      return (raw || []).map((c: any) => (typeof c === 'string' ? c : c?.name ?? '')).filter(Boolean);
    }
    if (legacyFormData) {
      const raw = (legacyFormData as any)?.categories ?? [];
      return (raw || []).map((c: any) => (typeof c === 'string' ? c : c?.name ?? '')).filter(Boolean);
    }
    const recipeCategories = (((recipeData as any)?.categories) ?? []) as any[];
    return recipeCategories.map((c: any) => (typeof c === 'string' ? c : c?.name ?? '')).filter(Boolean);
  }, [apiFormData, legacyFormData, recipeData]);

  const kitchens = useMemo(() => {
    const normalize = (value: unknown): string[] => {
      if (!Array.isArray(value)) return [];
      return value
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            const name = (item as Record<string, unknown>).name ?? (item as Record<string, unknown>).title;
            if (typeof name === 'string') return name;
          }
          return '';
        })
        .map((name) => name.trim())
        .filter((name) => Boolean(name) && !UUID_PATTERN.test(name));
    };

    if (apiFormData) {
      const metaKitchens = normalize((apiFormData as any)?.metaInfo?.kitchens ?? []);
      const rootKitchens = normalize((apiFormData as any)?.kitchens ?? []);
      return Array.from(new Set([...rootKitchens, ...metaKitchens]));
    }

    if (legacyFormData) {
      const legacyKitchens = normalize((legacyFormData as any)?.kitchens ?? []);
      return Array.from(new Set(legacyKitchens));
    }

    const recipeKitchens = normalize((recipeData as any)?.kitchens ?? (recipeData as any)?.kitchenIds ?? []);
    const metaKitchens = normalize((recipeData as any)?.metaInfo?.kitchens ?? []);
    const cuisine = (recipeData as any)?.cuisine;
    const combined = [...recipeKitchens, ...metaKitchens];
    if (typeof cuisine === 'string') {
      const trimmed = cuisine.trim();
      if (trimmed && !UUID_PATTERN.test(trimmed)) {
        combined.push(trimmed);
      }
    }
    return Array.from(new Set(combined));
  }, [apiFormData, legacyFormData, recipeData]);

  const recipeStats = useMemo(() => getRecipeStatsSnapshot(recipeData), [recipeData]);

  const badges = useMemo<BadgeResponseDto[]>(() => {
    if (isFormData) return [];
    const primary = Array.isArray(recipeData?.badges) ? (recipeData?.badges as BadgeResponseDto[]) : [];
    const fallback =
      !primary.length && Array.isArray((recipeData as any)?.metaInfo?.badges)
        ? ((recipeData as any)?.metaInfo?.badges as unknown[])
        : [];
    const source = primary.length > 0 ? primary : fallback;
    return source.filter(isBadgeResponse) as BadgeResponseDto[];
  }, [isFormData, recipeData]);

  const macros = useMemo(() => {
    if (!isFormData) return recipeData?.macros;
    if (apiFormData) return apiFormData.macros;
    return legacyFormData?.macros;
  }, [apiFormData, isFormData, legacyFormData, recipeData]);

  return {
    sources,
    steps,
    normalizedIngredients,
    measureLabels,
    getIngredientName,
    tags,
    categories,
    kitchens,
    recipeStats,
    badges,
    macros,
  };
};
