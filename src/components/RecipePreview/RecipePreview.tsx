import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Recipe } from '../../types';
import type {
  CreateRecipeDto,
  CreateRecipeIngredientDto,
  RecipeIngredientDto,
  CreateStepDto,
  StepResponseDto,
  ApiCreateRecipeDto,
  ApiUpdateRecipeDto,
  ApiUpdateRecipeIngredientDto,
  ApiUpdateStepDto,
} from '../../types/recipe.types';
import type { ApiIngredient } from '../../types/ingredient.types';
import {
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  PencilIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import NutritionInfo from '../NutritionInfo/NutritionInfo';
import { API_BASE_URL } from '../../services/api';
import IngredientsSection from '../IngredientsSection/IngredientsSection';
import HeroCard from '../HeroCard/HeroCard';
import ActionToggle from '../ActionToggle/ActionToggle';
import RatingControl from '../RatingControl/RatingControl';
import StepsSection from '../StepsSection/StepsSection';
import styles from './RecipePreview.module.css';
import InfoCard from '../InfoCard/InfoCard';
import RecipeTags from '../RecipeTags/RecipeTags';
import { RecipesService } from '../../services/recipesService';
import { KeycloakContext } from '../../providers/KeycloakProvider';
import CommentCard, { type CommentItem } from '../../pages/AdvancedProfile/components/CommentCard';
import { formatMeasureLabel } from '../../utils/measureLabel';
import { resolveIngredientIdentifiers } from '../../utils/recipeIngredient';
import { useMeasureLabels } from '../../hooks/useMeasureLabels';
import { useAvailableIngredients } from '../../hooks/useAvailableIngredients';

type FormRecipeData = CreateRecipeDto | ApiCreateRecipeDto | ApiUpdateRecipeDto;

type RecipePreviewProps = {
  formData?: FormRecipeData;
  recipe?: Recipe;
  onEdit?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  showActions?: boolean;
};

type NormalizedIngredient = { id: string; name: string; amount: string };

type RecipeSocialState = {
  likesCount: number;
  liked: boolean;
  likeLoading: boolean;
  favorite: boolean;
  favoriteLoading: boolean;
  favoritesCount: number;
  rating: number;
  ratingLoading: boolean;
  isAuthenticated: boolean;
  onToggleLike: () => void;
  onToggleFavorite: () => void;
  onSetRating: (value: number) => void;
  recipeId?: string;
};

type RecipeStatsSnapshot = {
  views: number;
  likes: number;
  favorites: number;
  rating: number;
  ratingsCount: number;
};

const pickNumber = (...values: unknown[]): number => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const getRecipeStatsSnapshot = (recipe?: Recipe): RecipeStatsSnapshot => {
  const source = (recipe as any)?.stats ?? (recipe as any)?.statistic ?? (recipe as any)?.statistics ?? {};
  const stats = typeof source === 'object' && source !== null ? source : {};

  return {
    views: pickNumber(
      (stats as any).views,
      (stats as any).viewsCount,
      (stats as any).viewCount,
      (stats as any).totalViews,
    ),
    likes: pickNumber(
      (stats as any).likes,
      (stats as any).likesCount,
      (stats as any).likeCount,
      (stats as any).totalLikes,
    ),
    favorites: pickNumber(
      (stats as any).favorites,
      (stats as any).favoritesCount,
      (stats as any).saves,
      (stats as any).savesCount,
      (stats as any).bookmarks,
      (stats as any).bookmarkCount,
    ),
    rating: pickNumber(
      (stats as any).avgRating,
      (stats as any).averageRating,
      (stats as any).averageRate,
      (stats as any).rating,
    ),
    ratingsCount: pickNumber(
      (stats as any).ratingsCount,
      (stats as any).ratingCount,
      (stats as any).reviewsCount,
      (stats as any).commentsCount,
      (stats as any).votesCount,
    ),
  };
};

const difficultyMap: Record<string, string> = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

const difficultyColor: Record<string, string> = {
  easy: 'var(--color-success)',
  medium: 'var(--color-warning)',
  hard: 'var(--color-danger)',
};

const isApiFormRecipe = (
  dto?: FormRecipeData | null,
): dto is ApiCreateRecipeDto | ApiUpdateRecipeDto => {
  return Boolean(dto && typeof dto === 'object' && 'composition' in dto);
};

const useRecipePreviewSources = (
  formData?: FormRecipeData,
  recipe?: Recipe,
) => {
  const isFormData = !recipe;
  const formRecipeData = isFormData ? formData : undefined;
  const apiFormData = isFormData && isApiFormRecipe(formRecipeData) ? formRecipeData : undefined;
  const legacyFormData =
    isFormData && !apiFormData ? (formRecipeData as CreateRecipeDto | undefined) : undefined;
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

const useRecipeSocialState = ({
  recipeData,
  isFormData,
  stats,
}: {
  recipeData?: Recipe;
  isFormData: boolean;
  stats: RecipeStatsSnapshot;
}): RecipeSocialState => {
  const keycloakCtx = useContext(KeycloakContext);
  const isAuthenticated = !!keycloakCtx?.authenticated;
  const recipeId = recipeData?.id;

  const initialLikes = !isFormData ? stats.likes : 0;
  const initialFavorites = !isFormData ? stats.favorites : 0;
  const initialLiked = !isFormData ? Boolean(recipeData?.state?.liked) : false;
  const initialFavorite = !isFormData ? Boolean(recipeData?.state?.favorite) : false;
  const initialRating = !isFormData
    ? (() => {
        const stateRate = recipeData?.state?.rate;
        if (stateRate !== null && stateRate !== undefined) return stateRate;
        return stats.rating;
      })()
    : 0;

  const [likesCount, setLikesCount] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [likeLoading, setLikeLoading] = useState(false);
  const [favorite, setFavorite] = useState(initialFavorite);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(initialFavorites);
  const [rating, setRating] = useState(initialRating);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    if (isFormData || !recipeId) return;
    setLikesCount(stats.likes);
    setLiked(Boolean(recipeData?.state?.liked));
    setFavorite(Boolean(recipeData?.state?.favorite));
    setFavoritesCount(stats.favorites);
    const stateRate = recipeData?.state?.rate;
    if (stateRate !== null && stateRate !== undefined) {
      setRating(stateRate);
    } else {
      setRating(stats.rating);
    }
  }, [
    isFormData,
    recipeId,
    stats.likes,
    stats.favorites,
    stats.rating,
    recipeData?.state?.liked,
    recipeData?.state?.favorite,
    recipeData?.state?.rate,
  ]);

  const handleToggleLike = async () => {
    if (isFormData || !recipeId || !isAuthenticated || likeLoading) return;
    const next = !liked;
    setLiked(next);
    setLikesCount((prev) => prev + (next ? 1 : -1));
    setLikeLoading(true);
    try {
      await RecipesService.toggleLike(recipeId, next);
    } catch (error) {
      console.error('Не удалось выполнить действие LIKE:', error);
      setLiked(!next);
      setLikesCount((prev) => prev + (next ? -1 : 1));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (isFormData || !recipeId || !isAuthenticated || favoriteLoading) return;
    const next = !favorite;
    setFavorite(next);
    setFavoritesCount((prev) => Math.max(0, prev + (next ? 1 : -1)));
    setFavoriteLoading(true);
    try {
      await RecipesService.toggleFavorite(recipeId, next);
    } catch (error) {
      console.error('Не удалось выполнить действие FAVORITE:', error);
      setFavorite(!next);
      setFavoritesCount((prev) => Math.max(0, prev + (next ? -1 : 1)));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSetRating = async (value: number) => {
    if (isFormData || !recipeId || !isAuthenticated || ratingLoading) return;
    const prev = rating;
    setRating(value);
    setRatingLoading(true);
    try {
      await RecipesService.setRating(recipeId, value);
    } catch (error) {
      console.error('Не удалось выполнить действие SET_RATE:', error);
      setRating(prev);
    } finally {
      setRatingLoading(false);
    }
  };

  return {
    likesCount,
    liked,
    likeLoading,
    favorite,
    favoriteLoading,
    favoritesCount,
    rating,
    ratingLoading,
    isAuthenticated,
    onToggleLike: handleToggleLike,
    onToggleFavorite: handleToggleFavorite,
    onSetRating: handleSetRating,
    recipeId,
  };
};

const RecipePreview: React.FC<RecipePreviewProps> = ({
  formData,
  recipe,
  onEdit,
  onSubmit,
  isSubmitting = false,
  showActions = true,
}) => {
  const {
    isFormData,
    formRecipeData,
    apiFormData,
    legacyFormData,
    recipeData,
    hasData,
  } = useRecipePreviewSources(formData, recipe);

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

  const aggregatedIngredients = useMemo(() => {
    const composition = Array.isArray(ingredientsSource)
      ? (ingredientsSource as Array<ApiUpdateRecipeIngredientDto | CreateRecipeIngredientDto | RecipeIngredientDto>)
      : [];
    const stepItems = Array.isArray(stepsSource)
      ? (stepsSource as Array<ApiUpdateStepDto | CreateStepDto | StepResponseDto>).flatMap(
          (step) => ((step as any)?.ingredients ?? []) as any[],
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

  const recipeStats = useMemo(() => getRecipeStatsSnapshot(recipeData), [recipeData]);

  const socialState = useRecipeSocialState({ recipeData, isFormData, stats: recipeStats });

  const macros = useMemo(() => {
    if (!isFormData) return recipeData?.macros;
    if (apiFormData) return apiFormData.macros;
    return legacyFormData?.macros;
  }, [apiFormData, isFormData, legacyFormData, recipeData]);

  const [showNutritionDetails, setShowNutritionDetails] = useState(false);

  const heroImageUrl = useMemo(() => {
    if (isFormData) return undefined;
    const raw = recipeData?.photos?.[0] || recipeData?.image;
    if (!raw) return undefined;
    const trimmed = String(raw).trim();
    if (!trimmed) return undefined;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `${API_BASE_URL}/photo/${trimmed}`;
  }, [isFormData, recipeData]);

  const title = useMemo(() => {
    return isFormData
      ? formRecipeData?.name ?? 'Название рецепта'
      : recipeData?.title || 'Название рецепта';
  }, [formRecipeData?.name, isFormData, recipeData?.title]);

  const description = useMemo(() => {
    if (isFormData) {
      if (apiFormData) return apiFormData.description ?? '';
      return legacyFormData?.description ?? '';
    }
    return recipeData?.description || 'Описание рецепта';
  }, [apiFormData, isFormData, legacyFormData?.description, recipeData?.description]);

  const activeMinutes = useMemo(() => {
    if (apiFormData) {
      const activeSec = Number(apiFormData.cookingTime?.activeTime ?? 0);
      return Math.max(0, Math.round(activeSec / 60));
    }
    if (legacyFormData) {
      const activeSec = Number(legacyFormData.cookTime ?? 0);
      return Math.max(0, Math.round(activeSec / 60));
    }
    return Math.max(0, Number(recipeData?.cookTime ?? 0));
  }, [apiFormData, legacyFormData, recipeData?.cookTime]);

  const totalMinutes = useMemo(() => {
    if (apiFormData) {
      const activeSec = Number(apiFormData.cookingTime?.activeTime ?? 0);
      const allSec = Number(apiFormData.cookingTime?.allTime ?? activeSec);
      return Math.max(0, Math.round(allSec / 60));
    }
    if (legacyFormData) {
      const activeSec = Number(legacyFormData.cookTime ?? 0);
      const allSec = Number(legacyFormData.allTime ?? activeSec);
      return Math.max(0, Math.round(allSec / 60));
    }
    const prep = Number(recipeData?.prepTime ?? 0);
    const cook = Number(recipeData?.cookTime ?? 0);
    return Math.max(0, Math.round(prep + cook));
  }, [apiFormData, legacyFormData, recipeData?.cookTime, recipeData?.prepTime]);

  const servings = useMemo(() => {
    if (apiFormData) return Number(apiFormData.serving?.unitCount ?? 1) || 1;
    if (legacyFormData) return Number((legacyFormData as any).unitCount ?? 1) || 1;
    return recipeData?.servings ?? 1;
  }, [apiFormData, legacyFormData, recipeData?.servings]);

  const difficulty = useMemo(() => {
    if (apiFormData) return apiFormData.level?.toLowerCase?.() ?? 'easy';
    if (legacyFormData) return legacyFormData.level?.toLowerCase?.() ?? 'easy';
    return recipeData?.difficulty ?? 'easy';
  }, [apiFormData, legacyFormData, recipeData?.difficulty]);

  const normalizedDifficulty = difficultyMap[difficulty] ? difficulty : 'easy';

  const tags = useMemo(() => {
    if (apiFormData) {
      const rawTags = apiFormData.metaInfo?.tags ?? [];
      return (rawTags || []).map((t) => String(t)).filter(Boolean);
    }
    if (legacyFormData) {
      return ((legacyFormData.tags ?? []) as any[])
        .map((t) => (typeof t === 'string' ? t : t?.name ?? ''))
        .filter(Boolean);
    }
    const recipeTags = ((recipeData as any)?.tags ?? []) as any[];
    return recipeTags
      .map((t) => (typeof t === 'string' ? t : t?.name ?? ''))
      .filter(Boolean) as string[];
  }, [apiFormData, legacyFormData, recipeData]);

  const normalizedIngredients = useMemo<NormalizedIngredient[]>(() => {
    return ingredientsSource.map((ingredient: any) => {
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

  if (!hasData) {
    return null;
  }

  const heroActions = !isFormData ? (
    <RecipeSocialActions
      liked={socialState.liked}
      likesCount={socialState.likesCount}
      likeLoading={socialState.likeLoading}
      favorite={socialState.favorite}
      favoriteLoading={socialState.favoriteLoading}
      isAuthenticated={socialState.isAuthenticated}
      onToggleLike={socialState.onToggleLike}
      onToggleFavorite={socialState.onToggleFavorite}
      favoritesCount={socialState.favoritesCount}
    />
  ) : undefined;
  const heroRating = !isFormData ? recipeStats.rating : 4.8;

  return (
    <div className={styles.recipePreview}>
      <div className={styles.previewContainer}>
        <RecipePreviewHero
          title={title || 'Название рецепта'}
          description={description || 'Описание рецепта'}
          imageUrl={heroImageUrl}
          author={(!isFormData ? recipeData?.author?.name : 'Автор рецепта') || 'Автор'}
          rating={heroRating}
          views={!isFormData ? recipeStats.views : undefined}
          actionsSlot={heroActions}
        />

        <RecipePreviewInfoGrid
          difficultyLabel={difficultyMap[normalizedDifficulty]}
          difficultyColor={difficultyColor[normalizedDifficulty]}
          totalMinutes={totalMinutes}
          activeMinutes={activeMinutes}
          servings={servings}
        />

        <RecipePreviewMainSections
          title={title}
          servings={Number(servings) || 1}
          ingredients={normalizedIngredients}
          macros={macros}
          showNutritionDetails={showNutritionDetails}
          onToggleNutrition={() => setShowNutritionDetails((prev) => !prev)}
          steps={steps}
          isFormData={isFormData}
          getIngredientName={getIngredientName}
          measureLabels={measureLabels}
          tags={tags}
        />

        {!isFormData && (
          <ReviewSection
            rating={socialState.rating}
            ratingLoading={socialState.ratingLoading}
            isAuthenticated={socialState.isAuthenticated}
            onSetRating={socialState.onSetRating}
            ratingsCount={recipeStats.ratingsCount}
          />
        )}

        {!isFormData && <CommentsSection recipe={recipeData} title={title} />}
      </div>

      {showActions && onEdit && onSubmit && (
        <RecipePreviewActions
          isSubmitting={isSubmitting}
          onEdit={onEdit}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
};

const RecipePreviewHero: React.FC<{
  title: string;
  description: string;
  imageUrl?: string;
  author: string;
  rating: number;
  views?: number;
  actionsSlot?: React.ReactNode;
}> = ({ title, description, imageUrl, author, rating, views, actionsSlot }) => (
  <HeroCard
    title={title}
    description={description}
    rating={rating}
    author={author}
    imageUrl={imageUrl}
    viewsCount={views}
    actionsSlot={actionsSlot}
  />
);

const RecipePreviewInfoGrid: React.FC<{
  difficultyLabel: string;
  difficultyColor: string;
  totalMinutes: number;
  activeMinutes: number;
  servings: number;
}> = ({ difficultyLabel, difficultyColor, totalMinutes, activeMinutes, servings }) => (
  <div className={styles.infoGrid}>
    <InfoCard
      icon={<StarIcon className={styles.infoIcon} />}
      label="Сложность"
      value={
        <span
          className={styles.difficultyBadge}
          style={{
            color: difficultyColor,
            background: `color-mix(in oklab, ${difficultyColor} 18%, transparent)`,
          }}
        >
          {difficultyLabel}
        </span>
      }
      tone="accent"
    />
    <InfoCard
      icon={<ClockIcon className={styles.infoIcon} />}
      label="Общее время"
      value={<span>{totalMinutes} мин</span>}
      tone="info"
    />
    <InfoCard
      icon={<ClockIcon className={styles.infoIcon} />}
      label="Активное время"
      value={<span>{activeMinutes} мин</span>}
      tone="warning"
    />
    <InfoCard
      icon={<UserGroupIcon className={styles.infoIcon} />}
      label="Порции"
      value={<span>{servings}</span>}
      tone="success"
    />
  </div>
);

const RecipePreviewMainSections: React.FC<{
  title: string;
  servings: number;
  ingredients: NormalizedIngredient[];
  macros?: {
    calories?: number;
    proteins?: number;
    fats?: number;
    carbs?: number;
  } | null;
  showNutritionDetails: boolean;
  onToggleNutrition: () => void;
  steps: Array<ApiUpdateStepDto | CreateStepDto | StepResponseDto>;
  isFormData: boolean;
  getIngredientName: (id: string) => string | undefined;
  measureLabels: Record<string, string>;
  tags: string[];
}> = ({
  title,
  servings,
  ingredients,
  macros,
  showNutritionDetails,
  onToggleNutrition,
  steps,
  isFormData,
  getIngredientName,
  measureLabels,
  tags,
}) => (
  <div className={styles.contentGrid}>
    <IngredientsSection
      title={title || 'Рецепт'}
      baseServings={servings}
      ingredients={ingredients}
    />

    <NutritionInfo
      expanded={showNutritionDetails}
      onToggle={onToggleNutrition}
      calories={macros?.calories}
      proteins={macros?.proteins}
      fats={macros?.fats}
      carbs={macros?.carbs}
    />

    <StepsSection
      steps={steps}
      isFormData={isFormData}
      getIngredientName={getIngredientName}
      measureLabels={measureLabels}
    />

    <RecipeTags tags={tags} />
  </div>
);

const ReviewSection: React.FC<{
  rating: number;
  ratingLoading: boolean;
  isAuthenticated: boolean;
  onSetRating: (value: number) => void;
  ratingsCount: number;
}> = ({ rating, ratingLoading, isAuthenticated, onSetRating, ratingsCount }) => (
  <div className={styles.reviewSection}>
    <h3 className={styles.reviewTitle}>Ваш отзыв</h3>
    <div className={styles.reviewControlsRow}>
      <span className={styles.reviewLabel}>Оцените рецепт:</span>
      <RatingControl
        value={rating}
        loading={ratingLoading}
        disabled={!isAuthenticated}
        onChange={onSetRating}
        countLabel={`${ratingsCount} оценок`}
      />
    </div>
    <div className={styles.reviewField}>
      <textarea
        className={styles.reviewTextarea}
        placeholder={
          isAuthenticated
            ? 'Поделитесь впечатлениями о рецепте… (скоро)'
            : 'Войдите, чтобы оставить отзыв'
        }
        disabled={!isAuthenticated}
        rows={4}
      />
    </div>
    <div className={styles.reviewActions}>
      <button type="button" className="ui-btn ui-btn--flat" disabled>
        Отправить отзыв (скоро)
      </button>
    </div>
  </div>
);

const CommentsSection: React.FC<{
  recipe?: Recipe;
  title: string;
}> = ({ recipe, title }) => (
  <div style={{ marginTop: '24px' }}>
    <h3 style={{ margin: '0 0 16px 0' }}>Комментарии</h3>
    {(
      [
        {
          id: 'c1',
          recipeTitle: title || 'Рецепт',
          recipeAuthor: recipe?.author?.name || 'Автор',
          recipeImage: recipe?.image,
          rating: Math.max(0, Math.min(5, Math.round((recipe?.stats?.rating ?? 4.8)))) || 4,
          verified: true,
          text: 'Очень вкусно! Обязательно приготовлю ещё раз.',
          likes: 3,
          replies: 1,
          dateISO: new Date().toISOString(),
        },
        {
          id: 'c2',
          recipeTitle: title || 'Рецепт',
          recipeAuthor: recipe?.author?.name || 'Автор',
          recipeImage: recipe?.image,
          rating: 5,
          verified: false,
          text: 'Спасибо за рецепт, получилось отлично!',
          likes: 1,
          replies: 0,
          dateISO: new Date(Date.now() - 86400000).toISOString(),
        },
      ] as CommentItem[]
    ).map((comment) => (
      <div key={comment.id} style={{ marginBottom: '12px' }}>
        <CommentCard item={comment} />
      </div>
    ))}
  </div>
);

const RecipePreviewActions: React.FC<{
  onEdit: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}> = ({ onEdit, onSubmit, isSubmitting }) => (
  <div className={styles.actions}>
    <button
      type="button"
      onClick={onEdit}
      className={styles.editButton}
      disabled={isSubmitting}
    >
      <PencilIcon className={styles.buttonIcon} />
      Продолжить редактирование
    </button>

    <button
      type="button"
      onClick={onSubmit}
      className={styles.submitButton}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span className={styles.spinner} />
          Создаем рецепт...
        </>
      ) : (
        <>
          <CheckIcon className={styles.buttonIcon} />
          Создать рецепт
        </>
      )}
    </button>
  </div>
);

const RecipeSocialActions: React.FC<{
  liked: boolean;
  likesCount: number;
  likeLoading: boolean;
  favorite: boolean;
  favoriteLoading: boolean;
  isAuthenticated: boolean;
  onToggleLike: () => void;
  onToggleFavorite: () => void;
  favoritesCount: number;
}> = ({
  liked,
  likesCount,
  likeLoading,
  favorite,
  favoriteLoading,
  isAuthenticated,
  onToggleLike,
  onToggleFavorite,
  favoritesCount,
}) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <ActionToggle
      type="like"
      active={liked}
      loading={likeLoading}
      disabled={!isAuthenticated}
      count={likesCount}
      onToggle={onToggleLike}
    />
    <ActionToggle
      type="favorite"
      active={favorite}
      loading={favoriteLoading}
      disabled={!isAuthenticated}
      count={favoritesCount}
      onToggle={onToggleFavorite}
    />
  </div>
);

export default RecipePreview;
