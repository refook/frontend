import React, { useState, useEffect, useContext, useRef } from 'react';
import { ingredientsService } from '../../services/ingredientsService';
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
  CheckIcon
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
import { productsService } from '../../services/productsService';
import { KeycloakContext } from '../../providers/KeycloakProvider';
import CommentCard, { type CommentItem } from '../../pages/AdvancedProfile/components/CommentCard';
import type { ProductMeasureResponseDto } from '../../types/api.types';
import { formatMeasureLabel } from '../../utils/measureLabel';

type FormRecipeData = CreateRecipeDto | ApiCreateRecipeDto | ApiUpdateRecipeDto;

const isApiFormRecipe = (dto?: FormRecipeData | null): dto is ApiCreateRecipeDto | ApiUpdateRecipeDto => {
  return Boolean(dto && typeof dto === 'object' && 'composition' in dto);
};

interface RecipePreviewProps {
  formData?: FormRecipeData;
  recipe?: Recipe;
  onEdit?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  showActions?: boolean;
}

const RecipePreview: React.FC<RecipePreviewProps> = ({
  formData,
  recipe,
  onEdit,
  onSubmit,
  isSubmitting = false,
  showActions = true
}) => {
  // Используем данные из recipe или formData
  const [availableIngredients, setAvailableIngredients] = useState<ApiIngredient[]>([]);

  // В режиме просмотра готового рецепта (есть prop recipe) имена ингредиентов уже приходят с API,
  // поэтому лишний запрос за списком ингредиентов не делаем, чтобы избежать ошибок/500.
  const isFormDataMode = !recipe;
  useEffect(() => {
    if (!isFormDataMode) return;
    const loadIngredients = async () => {
      try {
        const ingredients = await ingredientsService.getIngredientsForFridge();
        setAvailableIngredients(ingredients);
      } catch (error) {
        console.error('Ошибка при загрузке ингредиентов:', error);
        setAvailableIngredients([]);
      }
    };
    void loadIngredients();
  }, [isFormDataMode]);

  const isFormData = isFormDataMode;
  const formRecipeData = isFormData ? (formData as FormRecipeData | undefined) : undefined;
  const apiFormData = isFormData && isApiFormRecipe(formRecipeData) ? formRecipeData : undefined;
  const legacyFormData = isFormData && !apiFormData ? (formRecipeData as CreateRecipeDto | undefined) : undefined;
  const recipeData = !isFormData ? (recipe as Recipe | undefined) : undefined;
  const hasData = Boolean(formRecipeData || recipeData);

  const title = isFormData
    ? (formRecipeData?.name ?? 'Название рецепта')
    : (recipeData?.title || 'Название рецепта');

  const description = isFormData
    ? (apiFormData?.description ?? legacyFormData?.description ?? '')
    : (recipeData?.description || 'Описание рецепта');

  const activeMinutes = (() => {
    if (apiFormData) {
      const activeSec = Number(apiFormData.cookingTime?.activeTime ?? 0);
      return Math.max(0, Math.round(activeSec / 60));
    }
    if (legacyFormData) {
      const activeSec = Number(legacyFormData.cookTime ?? 0);
      return Math.max(0, Math.round(activeSec / 60));
    }
    return Math.max(0, recipeData?.cookTime ?? 0);
  })();

  const totalMinutes = (() => {
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
  })();

  const servings = (() => {
    if (apiFormData) {
      return Number(apiFormData.serving?.unitCount ?? 1) || 1;
    }
    if (legacyFormData) {
      return Number((legacyFormData as any).unitCount ?? 1) || 1;
    }
    return recipeData?.servings ?? 1;
  })();

  const difficulty = (() => {
    if (apiFormData) {
      return apiFormData.level?.toLowerCase?.() ?? 'easy';
    }
    if (legacyFormData) {
      return legacyFormData.level?.toLowerCase?.() ?? 'easy';
    }
    return recipeData?.difficulty ?? 'easy';
  })();

  const tags: string[] = (() => {
    if (apiFormData) {
      const rawTags = apiFormData.metaInfo?.tags ?? [];
      return (rawTags || []).map((t) => String(t)).filter(Boolean);
    }
    if (legacyFormData) {
      return ((legacyFormData.tags ?? []) as any[])
        .map((t) => (typeof t === 'string' ? t : (t?.name ?? '')))
        .filter(Boolean);
    }
    return ((((recipeData as any)?.tags ?? []).map((t: any) => (typeof t === 'string' ? t : (t?.name ?? '')))).filter((s: any) => Boolean(s)) as string[]);
  })();

  const ingredients: Array<CreateRecipeIngredientDto | ApiUpdateRecipeIngredientDto | RecipeIngredientDto> = (() => {
    if (apiFormData) {
      return apiFormData.composition?.ingredients ?? [];
    }
    if (legacyFormData) {
      return legacyFormData.ingredients ?? [];
    }
    return recipeData?.ingredients ?? [];
  })();

  const stepsRaw: Array<ApiUpdateStepDto | CreateStepDto | StepResponseDto> = (() => {
    if (apiFormData) {
      return apiFormData.composition?.steps ?? [];
    }
    if (legacyFormData) {
      return legacyFormData.steps ?? [];
    }
    return recipeData?.steps ?? [];
  })();

  const steps: Array<ApiUpdateStepDto | CreateStepDto | StepResponseDto> = React.useMemo(() => {
    return [...stepsRaw].sort((a: any, b: any) => Number(a?.index || 0) - Number(b?.index || 0));
  }, [stepsRaw]);

  const heroImageUrl = !isFormData
    ? (() => {
        const raw = ((recipeData?.photos?.[0]) || recipeData?.image);
        if (!raw) return undefined;
        const url = String(raw).trim();
        if (!url) return undefined;
        return /^https?:\/\//i.test(url) ? url : `${API_BASE_URL}/photo/${url}`;
      })()
    : undefined;

  if (!isFormData) {
    // Для отладки отображения изображения
    try { console.debug('RecipePreview heroImageUrl:', heroImageUrl); } catch {}
  }
  
  const difficultyMap: Record<string, string> = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно'
  };

  const difficultyColor: Record<string, string> = {
    easy: 'var(--color-success)',
    medium: 'var(--color-warning)',
    hard: 'var(--color-danger)'
  };

  const normalizedDifficulty = difficultyMap[difficulty] ? difficulty : 'easy';

  // Эмодзи для шагов теперь берутся в дочернем компоненте через utils/emoji

  const recipeId = recipeData?.id;
  const recipeLikes = recipeData?.stats?.likes;
  const recipeAvgRating = recipeData?.stats?.rating;
  const recipeStateLiked = recipeData?.state?.liked;
  const recipeStateFavorite = recipeData?.state?.favorite;
  const recipeStateRate = recipeData?.state?.rate;

  const measuresCacheRef = useRef<Map<string, ProductMeasureResponseDto[]>>(new Map());
  const [measureLabels, setMeasureLabels] = useState<Record<string, string>>({});
  const [variantNames, setVariantNames] = useState<Record<string, string>>({});

  const macros = !isFormData
    ? recipeData?.macros
    : (apiFormData?.macros ?? legacyFormData?.macros);

  useEffect(() => {
    const aggregated: Array<ApiUpdateRecipeIngredientDto | RecipeIngredientDto> = [];

    if (apiFormData?.composition) {
      aggregated.push(...(apiFormData.composition.ingredients ?? []));
      (apiFormData.composition.steps ?? []).forEach((step) => {
        aggregated.push(...(step?.ingredients ?? []));
      });
    } else if (!isFormData && recipeData) {
      const stepIngredients = (recipeData.steps || []).flatMap((step) => step?.ingredients || []);
      aggregated.push(...(recipeData.ingredients || []), ...stepIngredients);
    }

    if (aggregated.length === 0) return;

    const ingredientsToCheck = aggregated.filter((ing) => {
      const measureId = (ing as any)?.productMeasureId;
      return measureId && !measureLabels[measureId as string];
    });
    if (ingredientsToCheck.length === 0) return;

    let cancelled = false;

    const loadMeasureLabels = async () => {
      const updates: Record<string, string> = {};

      for (const ing of ingredientsToCheck) {
        const measureId = (ing as any).productMeasureId as string | undefined;
        if (!measureId) continue;
        const ingredientId = String((ing as any).id ?? '');
        if (!ingredientId) continue;

        const variantFlag = Boolean((ing as any).isVariant ?? (ing as any).isVariate);
        const cacheKey = `${variantFlag ? 'variant' : 'base'}:${ingredientId}`;

        try {
          let measures = measuresCacheRef.current.get(cacheKey);
          if (!measures) {
            measures = variantFlag
              ? await productsService.getVariantMeasures(ingredientId)
              : await productsService.getBaseMeasures(ingredientId);
            measuresCacheRef.current.set(cacheKey, measures);
          }
          const found = measures?.find((m) => m.id === measureId);
          if (found?.name) {
            updates[measureId] = found.name;
          }
        } catch (error) {
          console.error('Не удалось загрузить меры продукта', { productId: ingredientId, measureId }, error);
        }
      }

      if (!cancelled && Object.keys(updates).length > 0) {
        setMeasureLabels((prev) => ({ ...prev, ...updates }));
      }
    };

    void loadMeasureLabels();

    return () => {
      cancelled = true;
    };
  }, [apiFormData, isFormData, recipeData, measureLabels]);

  // Подгружаем названия вариантов по variantId для отображения
  useEffect(() => {
    const ids = new Set<string>();
    const collect = (arr: any[] | undefined) => {
      (arr || []).forEach((i: any) => {
        const vid = i?.variantId;
        if (typeof vid === 'string' && vid && !variantNames[vid]) ids.add(vid);
      });
    };
    if (apiFormData) {
      collect(apiFormData.composition?.ingredients as any);
      (apiFormData.composition?.steps || []).forEach((s) => collect((s as any)?.ingredients));
    } else if (!isFormData && recipeData) {
      collect(recipeData.ingredients as any);
      (recipeData.steps || []).forEach((s) => collect((s as any)?.ingredients));
    }
    if (ids.size === 0) return;
    let cancelled = false;
    (async () => {
      const updates: Record<string, string> = {};
      for (const vid of ids) {
        try {
          const v = await productsService.getProductVariantById(vid);
          if (v?.name) updates[vid] = v.name;
        } catch {}
      }
      if (!cancelled && Object.keys(updates).length > 0) {
        setVariantNames((prev) => ({ ...prev, ...updates }));
      }
    })();
    return () => { cancelled = true; };
  }, [apiFormData, isFormData, recipeData, variantNames]);

  type NormalizedIngredient = { id: string; name: string; amount: string };
  const normalizeIngredient = (
    ingredient: CreateRecipeIngredientDto | ApiUpdateRecipeIngredientDto | RecipeIngredientDto
  ): NormalizedIngredient => {
    if (apiFormData) {
      const ing = ingredient as ApiUpdateRecipeIngredientDto;
      const sourceIngredient = availableIngredients.find((i) => i.id === ing.id);
      const name = sourceIngredient?.name || 'Ингредиент';
      const measureId = ing.productMeasureId;
      const measureLabel = measureId ? measureLabels[measureId] : undefined;
      const unitLabel = formatMeasureLabel(measureLabel ? String(measureLabel) : undefined);
      const suffix = unitLabel ? ` ${unitLabel}` : '';
      return {
        id: `form-new:${ing.id}:${measureId ?? 'none'}:${ing.count}`,
        name,
        amount: `${ing.count}${suffix}`,
      };
    }

    if (legacyFormData) {
      const ing = ingredient as CreateRecipeIngredientDto;
      const ai = availableIngredients.find((i) => i.id === ing.id);
      const name = ai?.name || 'Ингредиент';
      const unitRaw = (ing as any).productUnit || (ing as any).measure || '';
      const unit = formatMeasureLabel(unitRaw ? String(unitRaw) : undefined);
      const suffix = unit ? ` ${unit}` : '';
      return { id: `form:${ing.id}:${unitRaw}:${ing.count}`, name, amount: `${ing.count}${suffix}` };
    }

    const ing = ingredient as RecipeIngredientDto;
    const name = ing.name || 'Ингредиент';
    // Новый API: конкретная мера доступна в ing.measure.name
    const measureNameFromApi = (ing as any)?.measure?.name as string | undefined;
    const measureId = (ing as any)?.productMeasureId as string | undefined;
    const measureLabelFromCache = measureId ? measureLabels[measureId] : undefined;
    const fallbackUnit = (ing as any).productUnit || (ing as any).measure || '';
    const unitLabelRaw = measureNameFromApi || measureLabelFromCache || fallbackUnit;
    const unitLabel = formatMeasureLabel(unitLabelRaw ? String(unitLabelRaw) : undefined);
    const unitSuffix = unitLabel ? ` ${unitLabel}` : '';
    return { id: `api:${ing.id}`, name, amount: `${ing.count}${unitSuffix}` };
  };

  // Локальные состояния для старой реализации ингредиентов больше не используются
  // Оставлены только для совместимости normalizeIngredient → IngredientsSection
  const [showNutritionDetails, setShowNutritionDetails] = useState<boolean>(false);

  // Лайки
  const initialLikes = !isFormData ? (recipeLikes ?? 0) : 0;
  const [likesCount, setLikesCount] = useState<number>(initialLikes);
  const [liked, setLiked] = useState<boolean>(() => (!isFormData ? Boolean(recipeStateLiked) : false));
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [favorite, setFavorite] = useState<boolean>(() => (!isFormData ? Boolean(recipeStateFavorite) : false));
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(() => {
    if (isFormData) return 0;
    if (recipeStateRate !== null && recipeStateRate !== undefined) {
      return recipeStateRate;
    }
    if (recipeAvgRating !== null && recipeAvgRating !== undefined) {
      return Math.round(recipeAvgRating) || 0;
    }
    return 0;
  });
  const [ratingLoading, setRatingLoading] = useState<boolean>(false);
  const keycloakCtx = useContext(KeycloakContext);
  const isAuthenticated = !!keycloakCtx?.authenticated;

  useEffect(() => {
    if (isFormData || !recipeId) return;
    setLikesCount(recipeLikes ?? 0);
    setLiked(Boolean(recipeStateLiked));
    setFavorite(Boolean(recipeStateFavorite));
    if (recipeStateRate !== null && recipeStateRate !== undefined) {
      setRating(recipeStateRate);
    } else {
      setRating(Math.round(recipeAvgRating ?? 0) || 0);
    }
  }, [
    isFormData,
    recipeId,
    recipeLikes,
    recipeAvgRating,
    recipeStateLiked,
    recipeStateFavorite,
    recipeStateRate
  ]);

  const handleToggleLike = async () => {
    if (isFormData || !recipeId) return;
    if (!isAuthenticated) {
      console.warn('Действие LIKE недоступно: пользователь не авторизован');
      return;
    }
    if (likeLoading) return;
    const next = !liked;
    setLiked(next);
    setLikesCount((c) => c + (next ? 1 : -1));
    setLikeLoading(true);
    try {
      await RecipesService.toggleLike(recipeId, next);
    } catch (e) {
      // откат
      setLiked(!next);
      setLikesCount((c) => c + (next ? -1 : 1));
      console.error('Не удалось выполнить действие LIKE:', e);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (isFormData || !recipeId) return;
    if (!isAuthenticated) return;
    if (favoriteLoading) return;
    const next = !favorite;
    setFavorite(next);
    setFavoriteLoading(true);
    try {
      await RecipesService.toggleFavorite(recipeId, next);
    } catch (e) {
      setFavorite(!next);
      console.error('Не удалось выполнить действие FAVORITE:', e);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSetRating = async (value: number) => {
    if (isFormData || !recipeId) return;
    if (!isAuthenticated) return;
    if (ratingLoading) return;
    const prev = rating;
    setRating(value);
    setRatingLoading(true);
    try {
      await RecipesService.setRating(recipeId, value);
    } catch (e) {
      setRating(prev);
      console.error('Не удалось выполнить действие SET_RATE:', e);
    } finally {
      setRatingLoading(false);
    }
  };

  if (!hasData) {
    return null;
  }

  return (
    <div className={styles.recipePreview}>
      <div className={styles.previewContainer}>
        <HeroCard
          title={title || 'Название рецепта'}
          description={description || 'Описание рецепта'}
          rating={
            !isFormData
              ? (((recipeData as any)?.stats?.avgRating ?? recipeData?.stats?.rating ?? 4.8))
              : 4.8
          }
          author={(isFormData ? 'Автор рецепта' : recipeData?.author?.name) || 'Автор'}
          imageUrl={heroImageUrl}
          viewsCount={!isFormData ? ((((recipeData as any)?.stats?.viewsCount ?? (recipeData as any)?.stats?.views) ?? undefined)) : undefined}
          actionsSlot={
            !isFormData && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <ActionToggle
                  type="like"
                  active={liked}
                  loading={likeLoading}
                  disabled={!isAuthenticated}
                  count={likesCount}
                  onToggle={handleToggleLike}
                />
                <ActionToggle
                  type="favorite"
                  active={favorite}
                  loading={favoriteLoading}
                  disabled={!isAuthenticated}
                  count={((recipeData as any)?.stats?.favoritesCount ?? (recipeData as any)?.stats?.saves) as number | undefined}
                  onToggle={handleToggleFavorite}
                />
              </div>
            )
          }
        />

        {/* Основная информация */}
        <div className={styles.infoGrid}>
          <InfoCard
            icon={<StarIcon className={styles.infoIcon} />}
            label="Сложность"
            value={
              <span
                className={styles.difficultyBadge}
                style={{
                  color: difficultyColor[normalizedDifficulty],
                  background: `color-mix(in oklab, ${difficultyColor[normalizedDifficulty]} 18%, transparent)`
                }}
              >
                {difficultyMap[normalizedDifficulty]}
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
          {/* блок лайков/избранного/рейтинга перенесён в заголовок HeroCard */}
        </div>

        <div className={styles.contentGrid}>
          {/* Ингредиенты */}
          <IngredientsSection
            title={title || 'Рецепт'}
            baseServings={Number(servings) || 1}
            ingredients={ingredients.map((ing: any) => normalizeIngredient(ing))}
          />

            {/* Пищевая ценность (на порцию) */}
          <NutritionInfo 
            expanded={showNutritionDetails} 
            onToggle={() => setShowNutritionDetails(v => !v)}
            calories={macros?.calories}
            proteins={macros?.proteins}
            fats={macros?.fats}
            carbs={macros?.carbs}
          />

          {/* Шаги приготовления */}
          <StepsSection
            steps={steps}
            isFormData={isFormData}
            getIngredientName={(id: string) => variantNames[id] || availableIngredients.find(ai => ai.id === id)?.name}
            measureLabels={measureLabels}
          />

          {/* Теги */}
          <RecipeTags tags={tags} />
        </div>

        {/* Блок времени приготовления удалён по требованию */}

        {/* Блок рейтинга и отзыва (заглушка) */}
        {!isFormData && (
          <div className={styles.reviewSection}>
            <h3 className={styles.reviewTitle}>Ваш отзыв</h3>
            <div className={styles.reviewControlsRow}>
              <span className={styles.reviewLabel}>Оцените рецепт:</span>
              <RatingControl
                value={rating}
                loading={ratingLoading}
                disabled={!isAuthenticated}
                onChange={handleSetRating}
                countLabel={`${Number((recipeData as any)?.stats?.ratingsCount ?? 0)} оценок`}
              />
            </div>
            <div className={styles.reviewField}>
              <textarea
                className={styles.reviewTextarea}
                placeholder={isAuthenticated ? 'Поделитесь впечатлениями о рецепте… (скоро)' : 'Войдите, чтобы оставить отзыв'}
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
        )}

        {/* Комментарии (заглушка) */}
        {!isFormData && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Комментарии</h3>
            {(
              [
                {
                  id: 'c1',
                  recipeTitle: title || 'Рецепт',
                  recipeAuthor: recipeData?.author?.name || 'Автор',
                  recipeImage: recipeData?.image,
                  rating: Math.max(0, Math.min(5, Math.round((recipeData?.stats?.rating ?? 4.8)))) || 4,
                  verified: true,
                  text: 'Очень вкусно! Обязательно приготовлю ещё раз.',
                  likes: 3,
                  replies: 1,
                  dateISO: new Date().toISOString(),
                },
                {
                  id: 'c2',
                  recipeTitle: title || 'Рецепт',
                  recipeAuthor: recipeData?.author?.name || 'Автор',
                  recipeImage: recipeData?.image,
                  rating: 5,
                  verified: false,
                  text: 'Спасибо за рецепт, получилось отлично!',
                  likes: 1,
                  replies: 0,
                  dateISO: new Date(Date.now() - 86400000).toISOString(),
                },
              ] as CommentItem[]
            ).map((c) => (
              <div key={c.id} style={{ marginBottom: '12px' }}>
                <CommentCard item={c} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Действия */}
      {showActions && onEdit && onSubmit && (
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
      )}
    </div>
  );
};

export default RecipePreview; 
