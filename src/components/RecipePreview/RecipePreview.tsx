import React, { useState, useEffect, useContext } from 'react';
import { ingredientsService } from '../../services/ingredientsService';
import type { Recipe } from '../../types';
import type { CreateRecipeDto, CreateRecipeIngredientDto, RecipeIngredientDto } from '../../types/recipe.types';
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
import Chip from '../Chip/Chip';
import StepsSection from '../StepsSection/StepsSection';
import styles from './RecipePreview.module.css';
import InfoCard from '../InfoCard/InfoCard';
import RecipeTags from '../RecipeTags/RecipeTags';
import { RecipesService } from '../../services/recipesService';
import { KeycloakContext } from '../../providers/KeycloakProvider';
import CommentCard, { type CommentItem } from '../../pages/AdvancedProfile/components/CommentCard';

interface RecipePreviewProps {
  formData?: CreateRecipeDto;
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

  const data = recipe || formData;
  if (!data) return null;

  const isFormData = isFormDataMode;
  
  const title = isFormData ? (data as CreateRecipeDto).name : (data as Recipe).title;
  const description = isFormData ? (data as CreateRecipeDto).description : (data as Recipe).description;
  const prepTime = isFormData ? (data as CreateRecipeDto).allTime : (data as Recipe).prepTime || 0;
  const cookTime = isFormData ? (data as CreateRecipeDto).cookTime : (data as Recipe).cookTime || 0;
  const servings = isFormData ? 1 : (data as Recipe).servings;
  const difficulty = isFormData ? (data as CreateRecipeDto).level.toLowerCase() : (data as Recipe).difficulty;
  const cuisine = isFormData ? undefined : (data as Recipe).cuisine;
  const tags: string[] = isFormData
    ? (((data as CreateRecipeDto).tags ?? []).map((t: any) => (typeof t === 'string' ? t : (t?.name ?? ''))).filter(Boolean))
    : ((((data as any).tags ?? []).map((t: any) => (typeof t === 'string' ? t : (t?.name ?? '')))).filter((s: any) => Boolean(s)) as string[]);
  const ingredients = isFormData ? (data as CreateRecipeDto).ingredients : (data as Recipe).ingredients;
  const steps = isFormData ? (data as CreateRecipeDto).steps : (data as Recipe).steps;
  const photos = isFormData ? (data as CreateRecipeDto).photos : (data as Recipe).photos;
  const heroImageUrl = !isFormData
    ? (() => {
        const raw = (((data as Recipe).photos?.[0]) || (data as Recipe).image);
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
  
  const totalTime = prepTime + cookTime;
  
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

  // Эмодзи для шагов теперь берутся в дочернем компоненте через utils/emoji

  type NormalizedIngredient = { id: string; name: string; amount: string };
  const normalizeIngredient = (ingredient: CreateRecipeIngredientDto | RecipeIngredientDto): NormalizedIngredient => {
    if (isFormData) {
      const ing = ingredient as CreateRecipeIngredientDto;
      const ai = availableIngredients.find(i => i.id === ing.id);
      const name = ai?.name || 'Ингредиент';
      const unit = (ing as any).productUnit || (ing as any).measure || '';
      return { id: `form:${ing.id}:${unit}:${ing.count}`, name, amount: `${ing.count} ${String(unit).toLowerCase()}` };
    } else {
      const ing = ingredient as RecipeIngredientDto;
      const name = ing.name || 'Ингредиент';
      const unit = (ing as any).productUnit || (ing as any).measure || '';
      return { id: `api:${ing.id}`, name, amount: `${ing.count} ${String(unit).toLowerCase()}` };
    }
  };

  // Локальные состояния для старой реализации ингредиентов больше не используются
  // Оставлены только для совместимости normalizeIngredient → IngredientsSection
  const [showNutritionDetails, setShowNutritionDetails] = useState<boolean>(false);
  const recipeTitle = isFormData ? (data as CreateRecipeDto).name : (data as Recipe).title;

  // Лайки
  const initialLikes = !isFormData ? ((data as Recipe).stats?.likes ?? 0) : 0;
  const [likesCount, setLikesCount] = useState<number>(initialLikes);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [favorite, setFavorite] = useState<boolean>(false);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(Math.round((!isFormData ? ((data as Recipe).stats?.rating ?? 0) : 0)) || 0);
  const [ratingLoading, setRatingLoading] = useState<boolean>(false);
  const keycloakCtx = useContext(KeycloakContext);
  const isAuthenticated = !!keycloakCtx?.authenticated;

  const handleToggleLike = async () => {
    if (isFormData || !(data as Recipe).id) return;
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
      await RecipesService.toggleLike((data as Recipe).id, next);
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
    if (isFormData || !(data as Recipe).id) return;
    if (!isAuthenticated) return;
    if (favoriteLoading) return;
    const next = !favorite;
    setFavorite(next);
    setFavoriteLoading(true);
    try {
      await RecipesService.toggleFavorite((data as Recipe).id, next);
    } catch (e) {
      setFavorite(!next);
      console.error('Не удалось выполнить действие FAVORITE:', e);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSetRating = async (value: number) => {
    if (isFormData || !(data as Recipe).id) return;
    if (!isAuthenticated) return;
    if (ratingLoading) return;
    const prev = rating;
    setRating(value);
    setRatingLoading(true);
    try {
      await RecipesService.setRating((data as Recipe).id, value);
    } catch (e) {
      setRating(prev);
      console.error('Не удалось выполнить действие SET_RATE:', e);
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className={styles.recipePreview}>
      <div className={styles.previewContainer}>
        <HeroCard
          title={title || 'Название рецепта'}
          description={description || 'Описание рецепта'}
          rating={
            !isFormData
              ? ((data as any).stats?.avgRating ?? (data as Recipe).stats?.rating ?? 4.8)
              : 4.8
          }
          author={(isFormData ? 'Автор рецепта' : (data as Recipe).author?.name) || 'Автор'}
          imageUrl={heroImageUrl}
          viewsCount={!isFormData ? (((data as any).stats?.viewsCount ?? (data as any).stats?.views) ?? undefined) : undefined}
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
                  count={((data as any).stats?.favoritesCount ?? (data as any).stats?.saves) as number | undefined}
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
                  color: difficultyColor[difficulty],
                  background: `color-mix(in oklab, ${difficultyColor[difficulty]} 18%, transparent)`
                }}
              >
                {difficultyMap[difficulty]}
              </span>
            }
          />
          <InfoCard
            icon={<ClockIcon className={styles.infoIcon} />}
            label="Общее время"
            value={<span>{totalTime} мин</span>}
          />
          <InfoCard
            icon={<ClockIcon className={styles.infoIcon} />}
            label="Активное время"
            value={<span>{cookTime} мин</span>}
          />
          <InfoCard
            icon={<UserGroupIcon className={styles.infoIcon} />}
            label="Порции"
            value={<span>{servings}</span>}
          />
          {/* блок лайков/избранного/рейтинга перенесён в заголовок HeroCard */}
        </div>

        {/* Теги */}
        <RecipeTags tags={tags} />

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
            calories={!isFormData ? (data as Recipe).macros?.calories : (data as CreateRecipeDto).macros?.calories}
            proteins={!isFormData ? (data as Recipe).macros?.proteins : (data as CreateRecipeDto).macros?.proteins}
            fats={!isFormData ? (data as Recipe).macros?.fats : (data as CreateRecipeDto).macros?.fats}
            carbs={!isFormData ? (data as Recipe).macros?.carbs : (data as CreateRecipeDto).macros?.carbs}
          />

          {/* Шаги приготовления */}
          <StepsSection
            steps={steps}
            isFormData={isFormData}
            getIngredientName={(id: string) => availableIngredients.find(ai => ai.id === id)?.name}
          />
        </div>

        {/* Дополнительная информация */}
        <div className={styles.additionalInfo}>
          <div className={styles.timing}>
            <h4 className={styles.timingTitle}>Время приготовления</h4>
            <div className={styles.timingDetails}>
              <span>Подготовка: {prepTime} мин</span>
              <span>Готовка: {cookTime} мин</span>
              <span>Общее время: {totalTime} мин</span>
            </div>
          </div>
        </div>

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
                countLabel={`${Number((data as any).stats?.ratingsCount ?? 0)} оценок`}
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
                  recipeAuthor: (data as Recipe).author?.name || 'Автор',
                  recipeImage: (data as Recipe).image,
                  rating: Math.max(0, Math.min(5, Math.round(((data as Recipe).stats?.rating ?? 4.8)))) || 4,
                  verified: true,
                  text: 'Очень вкусно! Обязательно приготовлю ещё раз.',
                  likes: 3,
                  replies: 1,
                  dateISO: new Date().toISOString(),
                },
                {
                  id: 'c2',
                  recipeTitle: title || 'Рецепт',
                  recipeAuthor: (data as Recipe).author?.name || 'Автор',
                  recipeImage: (data as Recipe).image,
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