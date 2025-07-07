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

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, viewMode = 'grid' }) => {
  const totalTime = recipe.prepTime + recipe.cookTime;
  const isFavorite = false; // TODO: Получить из Redux store

  const getDifficultyLabel = (difficulty: Recipe['difficulty']) => {
    const labels = {
      easy: 'Легко',
      medium: 'Средне',
      hard: 'Сложно'
    };
    return labels[difficulty];
  };

  const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
    const colors = {
      easy: 'var(--color-success)',
      medium: 'var(--color-warning)',
      hard: 'var(--color-danger)'
    };
    return colors[difficulty];
  };

  return (
    <div className={`${styles.recipeCard} ${styles[viewMode]}`}>
      <Link to={`/recipe/${recipe.id}`} className={styles.cardLink}>
        <div className={styles.imageContainer}>
          <img 
            src={recipe.image || '/placeholder-recipe.jpg'} 
            alt={recipe.title}
            className={styles.image}
            loading="lazy"
          />
          <div className={styles.imageOverlay}>
            <div className={styles.tags}>
              <span 
                className={styles.difficultyTag}
                style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
              >
                {getDifficultyLabel(recipe.difficulty)}
              </span>
              {recipe.cuisine && (
                <span className={styles.cuisineTag}>
                  {recipe.cuisine}
                </span>
              )}
            </div>
            <div className={styles.actions}>
              <button 
                className={`${styles.actionButton} ${isFavorite ? styles.favorite : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Добавить/убрать из избранного
                }}
              >
                {isFavorite ? (
                  <HeartIconSolid className={styles.actionIcon} />
                ) : (
                  <HeartIcon className={styles.actionIcon} />
                )}
              </button>
              <button 
                className={styles.actionButton}
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Добавить в закладки
                }}
              >
                <BookmarkIcon className={styles.actionIcon} />
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
              <span className={styles.metaText}>{totalTime} мин</span>
            </div>
            <div className={styles.metaItem}>
              <UserIcon className={styles.metaIcon} />
              <span className={styles.metaText}>{recipe.servings} порц.</span>
            </div>
            <div className={styles.metaItem}>
              <StarIcon className={styles.metaIcon} />
              <span className={styles.metaText}>{recipe.stats.rating}</span>
            </div>
          </div>
          
          <div className={styles.author}>
            <img 
              src={recipe.author.avatar || '/placeholder-avatar.jpg'} 
              alt={recipe.author.name}
              className={styles.authorAvatar}
            />
            <span className={styles.authorName}>{recipe.author.name}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard; 