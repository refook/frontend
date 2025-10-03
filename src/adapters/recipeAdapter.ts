import type { Recipe, RecipeResponseDto, StepResponseDto } from '../types';
import type { CreateRecipeDto, DifficultyLevel, TagResponseDto, UserInfoResponseDto } from '../types/recipe.types';
import { normalizeIngredientFromApi } from '../utils/recipeIngredient';
import { API_BASE_URL } from '../services/api';

const DEFAULT_MACROS = { calories: 0, proteins: 0, fats: 0, carbs: 0 };

export type RecipeLike = Recipe & {
  kitchenIds?: string[];
  metaInfo?: {
    kitchens?: string[];
    tags?: Array<TagResponseDto | string>;
  };
  tagObjects?: Array<TagResponseDto | string>;
  [key: string]: unknown;
};

export const createEmptyRecipeForm = (): CreateRecipeDto => ({
  name: '',
  description: '',
  level: 'EASY',
  kitchens: [],
  cookTime: 0,
  allTime: 0,
  photos: [],
  tags: [],
  ingredients: [],
  steps: [],
  baseUnit: 'GR',
  avgWeight: 100,
  unit: 'GRAM',
  macros: { ...DEFAULT_MACROS },
  recipeUnit: 'PORTION',
  unitCount: 1,
});

const extractKitchens = (recipe: RecipeLike): string[] => {
  if (Array.isArray(recipe.kitchenIds) && recipe.kitchenIds.length > 0) {
    return [...recipe.kitchenIds];
  }
  const metaKitchens = recipe.metaInfo?.kitchens;
  if (Array.isArray(metaKitchens) && metaKitchens.length > 0) {
    return [...metaKitchens];
  }
  return recipe.cuisine ? [recipe.cuisine as string] : [];
};

const asTag = (value: unknown): TagResponseDto | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    return { id: value, name: value };
  }
  const record = value as Record<string, unknown>;
  const id = (record.id ?? record.uuid ?? record.value) as string | undefined;
  if (!id) return null;
  const name = (record.name ?? record.title ?? record.label ?? id) as string | undefined;
  return { id, name: name ?? id };
};

const extractTags = (recipe: RecipeLike): TagResponseDto[] => {
  const sources = [recipe.tagObjects, recipe.metaInfo?.tags, recipe.tags];
  for (const source of sources) {
    if (Array.isArray(source) && source.length > 0) {
      return source.map(asTag).filter(Boolean) as TagResponseDto[];
    }
  }
  return [];
};

export const mapRecipeToInitialData = (recipe?: RecipeLike | null): CreateRecipeDto => {
  if (!recipe) {
    return createEmptyRecipeForm();
  }

  const level = (recipe.difficulty || 'easy').toUpperCase() as DifficultyLevel;

  return {
    name: recipe.title,
    description: recipe.description,
    level,
    kitchens: extractKitchens(recipe),
    cookTime: Number(recipe.cookTime || 0) * 60,
    allTime: Number((recipe.prepTime || 0) + (recipe.cookTime || 0)) * 60,
    photos: recipe.photos || [],
    tags: extractTags(recipe),
    ingredients: (recipe.ingredients || []).map((ingredient: unknown) =>
      normalizeIngredientFromApi(ingredient),
    ),
    steps: (recipe.steps || []).map((step) => ({
      id: step.id,
      index: step.index,
      name: step.name,
      description: step.description,
      photos: step.photos || [],
      ingredients: (step.ingredients || []).map((ingredient: unknown) =>
        normalizeIngredientFromApi(ingredient),
      ),
      time: step.time || 0,
    })),
    baseUnit: (recipe as any)?.servingBaseUnit || 'GR',
    avgWeight: Number((recipe as any)?.servingTotalWeight ?? 0),
    unit: (recipe as any)?.unit || 'GRAM',
    macros: ((recipe as any)?.macros as CreateRecipeDto['macros']) || { ...DEFAULT_MACROS },
    recipeUnit: (recipe as any)?.servingRecipeUnit || 'PORTION',
    unitCount: Number((recipe as any)?.servingUnitCount ?? 1),
  };
};

const extractKitchenIdsFromResponse = (apiRecipe: RecipeResponseDto): string[] | undefined => {
  const rawMeta = (apiRecipe as any)?.metaInfo?.kitchens;
  if (Array.isArray(rawMeta)) {
    const idsFromStrings = rawMeta.filter((value: unknown) => typeof value === 'string' && value.length > 0);
    if (idsFromStrings.length > 0) return idsFromStrings as string[];
    const idsFromObjects = rawMeta
      .map((entry: any) => entry?.id ?? entry?.uuid ?? entry?.value)
      .filter((value: unknown) => typeof value === 'string' && value.length > 0);
    if (idsFromObjects.length > 0) return idsFromObjects as string[];
  }

  const rawKitchens = (apiRecipe as any)?.kitchens;
  if (Array.isArray(rawKitchens)) {
    const ids = rawKitchens
      .map((entry: any) => entry?.id ?? entry?.uuid ?? entry?.value)
      .filter((value: unknown) => typeof value === 'string' && value.length > 0);
    if (ids.length > 0) return ids as string[];
  }

  return undefined;
};

const normalizeRecipePhotos = (apiRecipe: RecipeResponseDto): string[] => {
  const metaPhotos = (apiRecipe as any)?.metaInfo?.photos;
  if (Array.isArray(metaPhotos)) return metaPhotos as string[];
  return apiRecipe.photos || [];
};

const normalizeTagEntries = (apiRecipe: RecipeResponseDto): TagResponseDto[] => {
  const rawTags = (apiRecipe as any)?.metaInfo?.tags ?? (apiRecipe as any)?.tags ?? [];
  if (!Array.isArray(rawTags)) return [];

  return rawTags
    .map((tag) => {
      if (typeof tag === 'string') {
        return { id: tag, name: tag };
      }
      const record = tag as Record<string, unknown>;
      const id = record.id ?? record.uuid ?? record.value;
      if (!id || typeof id !== 'string') return null;
      const name = (record.name ?? record.title ?? record.label ?? id) as string;
      return { id, name };
    })
    .filter(Boolean) as TagResponseDto[];
};

const resolveUserRate = (apiState: unknown): number | null => {
  const rate = (apiState as any)?.rate;
  if (typeof rate === 'number') return rate;
  if (typeof rate === 'string' && rate.trim() !== '') {
    const parsed = Number(rate);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const mapSteps = (steps: StepResponseDto[] | undefined): StepResponseDto[] => {
  return (steps || [])
    .map((step) => ({
      ...step,
      photos: step.photos || [],
      ingredients: step.ingredients || [],
    }))
    .sort((a, b) => Number(a.index || 0) - Number(b.index || 0));
};

export const mapRecipeResponseToRecipe = (
  apiRecipe: RecipeResponseDto,
  fallbackAuthor?: UserInfoResponseDto,
): Recipe => {
  const activeSeconds = Number(((apiRecipe as any)?.cookingTime?.activeTime) ?? 0);
  const allSeconds = Number(((apiRecipe as any)?.cookingTime?.allTime) ?? activeSeconds);
  const cookTimeMinutes = Math.max(0, Math.round(activeSeconds / 60));
  const prepTimeMinutes = Math.max(0, Math.round((allSeconds - activeSeconds) / 60));

  const photos = normalizeRecipePhotos(apiRecipe);
  const tagEntries = normalizeTagEntries(apiRecipe);
  const tags = tagEntries.map((tag) => tag.name).filter(Boolean);
  const tagObjects = tagEntries.length > 0 ? tagEntries : undefined;

  const apiState = (apiRecipe as any)?.state || {};
  const userRate = resolveUserRate(apiState);

  const imageUrl = (() => {
    const firstPhoto = photos?.[0];
    if (!firstPhoto) return undefined;
    return /^https?:\/\//i.test(firstPhoto) ? firstPhoto : `${API_BASE_URL}/photo/${firstPhoto}`;
  })();

  const ingredients = ((apiRecipe as any)?.composition?.ingredients || apiRecipe.ingredients || []) as Recipe['ingredients'];
  const steps = mapSteps(((apiRecipe as any)?.composition?.steps || apiRecipe.steps || []) as StepResponseDto[]);

  const servingInfo = (apiRecipe as any)?.serving || {};

  const ownerSource = apiRecipe.ownerUser || fallbackAuthor;
  const author = ownerSource
    ? {
        id: String(ownerSource.id ?? ownerSource.username ?? '0'),
        name: ownerSource.name || ownerSource.username || 'Автор',
        avatar: ownerSource.photo || undefined,
      }
    : {
        id: '0',
        name: 'Автор',
        avatar: undefined,
      };

  const apiStats = ((apiRecipe as any)?.stats ?? (apiRecipe as any)?.statistic ?? {}) as Record<string, unknown>;

  return {
    id: apiRecipe.id,
    title: apiRecipe.name,
    description: apiRecipe.description,
    photos,
    image: imageUrl,
    prepTime: prepTimeMinutes,
    cookTime: cookTimeMinutes,
    servings: Number(servingInfo?.unitCount ?? 4),
    difficulty: (apiRecipe.level || 'easy').toLowerCase() as Recipe['difficulty'],
    cuisine: apiRecipe.kitchen,
    kitchenIds: extractKitchenIdsFromResponse(apiRecipe),
    tags,
    ...(tagObjects ? { tagObjects } : {}),
    ingredients,
    steps,
    servingBaseUnit: servingInfo?.baseUnit,
    servingTotalWeight: servingInfo?.totalWeight,
    servingRecipeUnit: servingInfo?.recipeUnit,
    servingUnitCount: servingInfo?.unitCount,
    macros: (apiRecipe as any)?.macros
      ? {
          calories: Number((apiRecipe as any).macros?.calories ?? 0),
          proteins: Number((apiRecipe as any).macros?.proteins ?? 0),
          fats: Number((apiRecipe as any).macros?.fats ?? 0),
          carbs: Number((apiRecipe as any).macros?.carbs ?? 0),
        }
      : undefined,
    state: {
      liked: Boolean((apiState as any)?.liked),
      favorite: Boolean((apiState as any)?.favorite),
      rate: userRate,
    },
    author,
    stats: {
      views: Number(apiStats.viewsCount ?? apiStats.views ?? apiStats.viewCount ?? 0),
      likes: Number(apiStats.likesCount ?? apiStats.likes ?? apiStats.likeCount ?? 0),
      saves: Number(
        apiStats.favoritesCount ?? apiStats.saves ?? apiStats.savesCount ?? apiStats.bookmarks ?? 0,
      ),
      rating: Number(
        apiStats.avgRating ?? apiStats.averageRating ?? apiStats.averageRate ?? apiStats.rating ?? 0,
      ),
      reviewsCount: Number(
        apiStats.ratingsCount ?? apiStats.reviewsCount ?? apiStats.commentsCount ?? apiStats.votesCount ?? 0,
      ),
    },
    createdAt: apiRecipe.createdAt,
    updatedAt: apiRecipe.updatedAt,
  };
};

export const mapShortRecipeResponseToRecipe = (
  short: any,
  fallbackAuthor?: { id: string | number; name: string; avatar?: string | null }
): Recipe => {
  const activeSeconds = Number(short?.cookingTime?.activeTime ?? 0);
  const allSeconds = Number(short?.cookingTime?.allTime ?? activeSeconds);
  const cookTimeMinutes = Math.max(0, Math.round(activeSeconds / 60));
  const prepTimeMinutes = Math.max(0, Math.round((allSeconds - activeSeconds) / 60));

  const photos = normalizeRecipePhotos(short as RecipeResponseDto);
  const tagEntries = normalizeTagEntries(short as RecipeResponseDto);
  const tags = tagEntries.map((tag) => tag.name).filter(Boolean);
  const tagObjects = tagEntries.length > 0 ? tagEntries : undefined;

  const authorSource = short?.ownerUser || fallbackAuthor;
  const author = authorSource
    ? {
        id: String(authorSource.id ?? authorSource.username ?? '0'),
        name: authorSource.name || authorSource.username || 'Автор',
        avatar: authorSource.photo || authorSource.avatar || undefined,
      }
    : {
        id: '0',
        name: 'Автор',
        avatar: undefined,
      };

  return {
    id: String(short.id),
    title: short.name ?? 'Без названия',
    description: short.description ?? '',
    photos,
    image: (() => {
      const firstPhoto = photos?.[0];
      if (!firstPhoto) return undefined;
      return /^https?:\/\//i.test(firstPhoto) ? firstPhoto : `${API_BASE_URL}/photo/${firstPhoto}`;
    })(),
    prepTime: prepTimeMinutes,
    cookTime: cookTimeMinutes,
    servings: Number(short?.servings ?? 4),
    difficulty: String(short.level || 'EASY').toLowerCase() as Recipe['difficulty'],
    cuisine: (short.kitchens && short.kitchens[0]?.name) || short.kitchen || undefined,
    kitchenIds: undefined,
    tags,
    ...(tagObjects ? { tagObjects } : {}),
    ingredients: [],
    steps: [],
    state: undefined,
    author,
    macros: undefined,
    stats: {
      views: Number(short?.statistic?.viewsCount ?? 0),
      likes: Number(short?.statistic?.likesCount ?? 0),
      saves: Number(short?.statistic?.favoritesCount ?? 0),
      rating: Number(short?.statistic?.avgRating ?? 0),
      reviewsCount: Number(short?.statistic?.commentsCount ?? 0),
    },
    createdAt: short.updatedAt ?? short.createdAt ?? new Date().toISOString(),
    updatedAt: short.updatedAt ?? short.createdAt ?? new Date().toISOString(),
  };
};
