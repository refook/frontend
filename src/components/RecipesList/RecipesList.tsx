import React from 'react';
import type { Recipe } from '../../types';
import RecipeCard from '../RecipeCard/RecipeCard';
import RecipeCardSkeleton from '../RecipeCard/RecipeCardSkeleton';

interface RecipesListProps {
  recipes: Recipe[];
  loading: boolean;
  viewMode?: 'grid' | 'list';
}

const RecipesList: React.FC<RecipesListProps> = ({ recipes, loading, viewMode = 'grid' }) => {
  const containerClass = viewMode === 'list'
    ? 'flex flex-col gap-4 w-full'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full';

  if (loading && recipes.length === 0) {
    return (
      <div className={containerClass}>
        {Array.from({ length: 12 }).map((_, index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="text-6xl mb-6">🔍</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Рецепты не найдены</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Попробуйте изменить параметры поиска или очистить фильтры
        </p>
      </div>
    );
  }

  return (
    <div className={containerClass}>
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