import React from 'react';
import { Link } from 'react-router-dom';
import type { Recipe } from '../../types';
import { 
  ClockIcon, 
  UserIcon, 
  StarIcon, 
  HeartIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import styles from './RecipeCard.module.css';

interface RecipeCardProps {
  recipe: Recipe;
  viewMode?: 'grid' | 'list';
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  viewMode = 'grid'
}) => {
  const getDifficultyLabel = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Средне';
      case 'hard': return 'Сложно';
      default: return 'Неизвестно';
    }
  };

  const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
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

  const totalTime = formatTime((recipe.prepTime || 0) + (recipe.cookTime || 0));

  return (
    <div className={`${styles.card} ${viewMode === 'list' ? styles.listCard : styles.gridCard}`}>
      <Link to={`/recipe/${recipe.id}`} className={styles.cardLink}>
        <div className={styles.imageContainer}>
          <img 
            src={recipe.image || '/api/placeholder/300/200'} 
            alt={recipe.title}
            className={styles.image}
          />
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
          <h3 className={styles.title}>{recipe.title}</h3>
          <p className={styles.description}>{recipe.description}</p>
          
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <ClockIcon className={styles.metaIcon} />
              <span>{totalTime}</span>
            </div>
            <div className={styles.metaItem}>
              <UserIcon className={styles.metaIcon} />
              <span>{recipe.servings} порций</span>
            </div>
            <div className={styles.metaItem}>
              <StarIcon 
                className={styles.metaIcon} 
                style={{ color: getDifficultyColor(recipe.difficulty) }}
              />
              <span>{getDifficultyLabel(recipe.difficulty)}</span>
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

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className={styles.ingredients}>
                <h4 className={styles.ingredientsTitle}>
                  Ингредиенты ({recipe.ingredients.length})
                </h4>
                <div className={styles.ingredientsList}>
                  {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                    <div key={index} className={styles.ingredient}>
                      <span className={styles.ingredientName}>{ingredient.name}</span>
                      <span className={styles.ingredientAmount}>
                        {ingredient.count} {ingredient.measure.toLowerCase()}
                      </span>
                    </div>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <div className={styles.moreIngredients}>
                      +{recipe.ingredients.length - 3} ингр.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard; 