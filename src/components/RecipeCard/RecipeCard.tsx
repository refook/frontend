import React from 'react';
import { Link } from 'react-router-dom';
import type { Recipe } from '../../types';
import type { CreateRecipeDto } from '../../types/recipe.types';
import { 
  ClockIcon, 
  UserIcon, 
  StarIcon, 
  HeartIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import styles from './RecipeCard.module.css';
import { FOOD_PLACEHOLDER_EMOJIS, hashStringToIndex } from '../../utils/emoji';

interface RecipeCardProps {
  recipe: Recipe | CreateRecipeDto;
  viewMode?: 'grid' | 'list';
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  viewMode = 'grid'
}) => {
  // Определяем, является ли recipe объектом CreateRecipeDto
  const isFormData = 'portion' in recipe && 'allTime' in recipe;
  const seedString = isFormData ? (recipe.name ?? '') : (recipe.title ?? '');
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
  console.log('Recipe data:', recipe);
  console.log('Is form data:', isFormData);

  // Получаем значения в зависимости от типа данных
  const prepTime = isFormData ? recipe.allTime : (recipe.prepTime || 0);
  const cookTime = isFormData ? recipe.cookTime : (recipe.cookTime || 0);
  const servingsCount = isFormData ? (recipe.portion || 4) : (recipe.servings || 4); // Используем дефолтное значение 4 порции

  console.log('Calculated values:', { prepTime, cookTime, servingsCount });
  
  const totalTime = formatTime(prepTime + cookTime);

  return (
    <div className={`${styles.card} ${viewMode === 'list' ? styles.listCard : styles.gridCard}`}>
      <Link to={`/recipe/${isFormData ? '' : recipe.id}`} className={styles.cardLink}>
        <div className={styles.imageContainer}>
          {(
            (isFormData && recipe.photos?.[0]) || (!isFormData && (recipe as Recipe).image)
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
          <div className={styles.overlay}>
            <div className={styles.actions}>
              <button className={styles.actionBtn}>
                <HeartIcon className={styles.icon} />
              </button>
              <button className={styles.actionBtn}>
                <BookmarkIcon className={styles.icon} />
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.title}>{isFormData ? recipe.name : recipe.title}</h3>
          <p className={styles.description}>{recipe.description}</p>
          
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <ClockIcon className={styles.metaIcon} />
              <span>{totalTime}</span>
            </div>
            <div className={styles.metaItem}>
              <UserIcon className={styles.metaIcon} />
              <span>{servingsCount} порций</span>
            </div>
            <div className={styles.metaItem}>
              <StarIcon 
                className={styles.metaIcon} 
                style={{ color: getDifficultyColor(isFormData ? recipe.level : recipe.difficulty) }}
              />
              <span>{getDifficultyLabel(isFormData ? recipe.level : recipe.difficulty)}</span>
            </div>
          </div>
          
          <div className={styles.footer}>
            {recipe.tags && recipe.tags.length > 0 && (
              <div className={styles.tags}>
                {recipe.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
                {recipe.tags.length > 3 && (
                  <span className={styles.moreTag}>+{recipe.tags.length - 3}</span>
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