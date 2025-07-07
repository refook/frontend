import React from 'react';
import type { Recipe } from '../../types';
import RecipeCard from '../RecipeCard/RecipeCard';
import RecipeCardSkeleton from '../RecipeCard/RecipeCardSkeleton';
import styles from './RecipesList.module.css';

interface RecipesListProps {
  recipes: Recipe[];
  loading: boolean;
  viewMode?: 'grid' | 'list';
}

const RecipesList: React.FC<RecipesListProps> = ({ 
  recipes, 
  loading, 
  viewMode = 'grid' 
}) => {
  if (loading && recipes.length === 0) {
    return (
      <div className={`${styles.recipesList} ${styles[viewMode]}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3 className={styles.emptyTitle}>Рецепты не найдены</h3>
        <p className={styles.emptyDescription}>
          Попробуйте изменить параметры поиска или очистить фильтры
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles.recipesList} ${styles[viewMode]}`}>
      {recipes.map((recipe) => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          viewMode={viewMode}
        />
      ))}
      {loading && (
        <>
          {Array.from({ length: 6 }).map((_, index) => (
            <RecipeCardSkeleton key={`skeleton-${index}`} />
          ))}
        </>
      )}
    </div>
  );
};

export default RecipesList; 