import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Recipe } from '../../types';
import type { CreateRecipeDto } from '../../types/recipe.types';
import {
  ClockIcon,
  UserIcon,
  StarIcon,
  HeartIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';
import styles from './RecipeCard.module.css';
import { FOOD_PLACEHOLDER_EMOJIS, hashStringToIndex } from '../../utils/emoji';
import { RecipesService } from '../../services/recipesService';

interface RecipeCardProps {
  recipe: Recipe | CreateRecipeDto;
  viewMode?: 'grid' | 'list';
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  viewMode = 'grid'
}) => {
  // Определяем, является ли recipe объектом CreateRecipeDto
  const isFormData = 'allTime' in recipe && 'level' in recipe && 'ingredients' in recipe;
  const seedString = isFormData ? ((recipe as CreateRecipeDto).name ?? '') : ((recipe as Recipe).title ?? '');
  const fallbackEmoji = FOOD_PLACEHOLDER_EMOJIS[hashStringToIndex(seedString, FOOD_PLACEHOLDER_EMOJIS.length)];
  const getDifficultyLabel = (difficulty: Recipe['difficulty'] | CreateRecipeDto['level']) => {
    if (difficulty === 'EASY') return 'Легко';
    if (difficulty === 'MEDIUM') return 'Средне';
    if (difficulty === 'HARD') return 'Сложно';
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Средне';
      case 'hard': return 'Сложно';
      default: return 'Неизвестно';
    }
  };

  const getDifficultyColor = (difficulty: Recipe['difficulty'] | CreateRecipeDto['level']) => {
    if (difficulty === 'EASY') return '#10b981';
    if (difficulty === 'MEDIUM') return '#f59e0b';
    if (difficulty === 'HARD') return '#ef4444';
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Конвертируем время из минут в читаемый формат
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
  };

  // Логируем входящие данные для отладки
  //console.log('Recipe data:', recipe);
  //console.log('Is form data:', isFormData);

  // Получаем значения в зависимости от типа данных
  const prepTime = isFormData ? (recipe as CreateRecipeDto).allTime : ((recipe as Recipe).prepTime || 0);
  const cookTime = isFormData ? (recipe as CreateRecipeDto).cookTime : ((recipe as Recipe).cookTime || 0);
  const servingsCount = isFormData ? 1 : ((recipe as Recipe).servings || 4);

  //console.log('Calculated values:', { prepTime, cookTime, servingsCount });
  
  const totalTime = formatTime(prepTime + cookTime);
  const ratingValue = !isFormData ? Number((recipe as Recipe)?.stats?.rating ?? 0) : 0;

  const recipeState = !isFormData ? (recipe as Recipe).state : undefined;
  const recipeId = !isFormData ? (recipe as Recipe).id : undefined;

  const [isLiked, setIsLiked] = useState(Boolean(recipeState?.liked));
  const [isFavorite, setIsFavorite] = useState(Boolean(recipeState?.favorite));
  const [likeLoading, setLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const handleToggleLike = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!recipeId || likeLoading) return;

      const next = !isLiked;
      setIsLiked(next);
      setLikeLoading(true);
      try {
        await RecipesService.toggleLike(recipeId, next);
      } catch (error) {
        console.error('RecipeCard: не удалось переключить лайк', error);
        setIsLiked(!next);
      } finally {
        setLikeLoading(false);
      }
    },
    [recipeId, isLiked, likeLoading],
  );

  const handleToggleFavorite = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!recipeId || favoriteLoading) return;

      const next = !isFavorite;
      setIsFavorite(next);
      setFavoriteLoading(true);
      try {
        await RecipesService.toggleFavorite(recipeId, next);
      } catch (error) {
        console.error('RecipeCard: не удалось переключить избранное', error);
        setIsFavorite(!next);
      } finally {
        setFavoriteLoading(false);
      }
    },
    [recipeId, isFavorite, favoriteLoading],
  );

  const LikeIcon = isLiked ? HeartIconSolid : HeartIcon;
  const FavoriteIcon = isFavorite ? BookmarkIconSolid : BookmarkIcon;

  const renderLikeButton = (suffix: string) => {
    const LikeIconComponent = isLiked ? HeartIconSolid : HeartIcon;

    return (
      <button
        key={`like-${suffix}`}
        className={`${styles.actionBtn} ${isLiked ? styles.actionBtnActive : ''}`}
        type="button"
        aria-pressed={isLiked}
        aria-label={isLiked ? 'Убрать лайк' : 'Поставить лайк'}
        title={isLiked ? 'Лайк поставлен' : 'Поставить лайк'}
        onClick={handleToggleLike}
        disabled={likeLoading}
      >
        <LikeIconComponent className={styles.icon} />
      </button>
    );
  };

  const renderFavoriteButton = (suffix: string) => {
    const FavoriteIconComponent = isFavorite ? BookmarkIconSolid : BookmarkIcon;

    return (
      <button
        key={`favorite-${suffix}`}
        className={`${styles.actionBtn} ${isFavorite ? styles.actionBtnActive : ''}`}
        type="button"
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        title={isFavorite ? 'В избранном' : 'Добавить в избранное'}
        onClick={handleToggleFavorite}
        disabled={favoriteLoading}
      >
        <FavoriteIconComponent className={styles.icon} />
      </button>
    );
  };

  const persistentButtons: React.ReactNode[] = [];
  const hoverButtons: React.ReactNode[] = [];

  if (isLiked) {
    persistentButtons.push(renderLikeButton('persistent'));
  } else {
    hoverButtons.push(renderLikeButton('hover'));
  }

  if (isFavorite) {
    persistentButtons.push(renderFavoriteButton('persistent'));
  } else {
    hoverButtons.push(renderFavoriteButton('hover'));
  }

  const overlayClassName = `${styles.overlay} ${isLiked || isFavorite ? styles.overlayPersistent : ''}`;

  return (
    <div className={`${styles.card} ${viewMode === 'list' ? styles.listCard : styles.gridCard}`}>
      <Link to={`/recipe/${isFormData ? '' : (recipe as Recipe).id}`} className={styles.cardLink}>
        <div className={styles.imageContainer}>
          {(
            (isFormData && (recipe as CreateRecipeDto).photos?.[0]) || (!isFormData && (recipe as Recipe).image)
          ) ? (
            <img 
              src={isFormData ? `/api/v1/photo/${(recipe as CreateRecipeDto).photos?.[0]}` : ((recipe as Recipe).image as string)}
              alt={isFormData ? (recipe as CreateRecipeDto).name : (recipe as Recipe).title}
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder} aria-label="placeholder">
              <span className={styles.placeholderEmoji}>{fallbackEmoji}</span>
            </div>
          )}
          <div className={overlayClassName}>
            {persistentButtons.length > 0 && (
              <div className={`${styles.actions} ${styles.actionsPersistent}`}>
                {persistentButtons}
              </div>
            )}
            {hoverButtons.length > 0 && (
              <div className={`${styles.actions} ${styles.actionsHover}`}>
                {hoverButtons}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.title}>{isFormData ? (recipe as CreateRecipeDto).name : (recipe as Recipe).title}</h3>
          <p className={styles.description}>{isFormData ? (recipe as CreateRecipeDto).description : (recipe as Recipe).description}</p>
          
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <ClockIcon className={styles.metaIcon} />
              <span>{totalTime}</span>
            </div>
            {!isFormData && ratingValue > 0 && (
              <div className={`${styles.metaItem} ${styles.metaRating}`}>
                <StarIcon className={`${styles.metaIcon} ${styles.ratingIcon}`} />
                <span>{ratingValue.toFixed(1)}</span>
              </div>
            )}
            <div className={styles.metaItem}>
              <StarIcon
                className={styles.metaIcon}
                style={{ color: getDifficultyColor(isFormData ? (recipe as CreateRecipeDto).level : (recipe as Recipe).difficulty) }}
              />
              <span>{getDifficultyLabel(isFormData ? (recipe as CreateRecipeDto).level : (recipe as Recipe).difficulty)}</span>
            </div>
          </div>
          
          <div className={styles.footer}>
            {((isFormData ? (recipe as CreateRecipeDto).tags : (recipe as Recipe).tags) as any)?.length > 0 && (
              <div className={styles.tags}>
                {((isFormData ? (recipe as CreateRecipeDto).tags : (recipe as Recipe).tags) as any).slice(0, 3).map((tag: any, index: number) => (
                  <span key={index} className={styles.tag}>
                    {typeof tag === 'string' ? tag : (tag?.name ?? '')}
                  </span>
                ))}
                {(((isFormData ? (recipe as CreateRecipeDto).tags : (recipe as Recipe).tags) as any).length > 3) && (
                  <span className={styles.moreTag}>+{((isFormData ? (recipe as CreateRecipeDto).tags : (recipe as Recipe).tags) as any).length - 3}</span>
                )}
              </div>
            )}


          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard; 
