import React from 'react';
import { Link } from 'react-router-dom';
import type { Recipe } from '../../types';
import type { CreateRecipeDto } from '../../types/recipe.types';
import { 
  ClockIcon, 
  UserIcon, 
  StarIcon
} from '@heroicons/react/24/outline';

interface RecipeCardProps {
  recipe: Recipe | CreateRecipeDto;
  viewMode?: 'grid' | 'list';
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, viewMode = 'grid' }) => {
  const isFormData = 'portion' in recipe && 'allTime' in recipe;

  const getDifficultyLabel = (
    difficulty: Recipe['difficulty'] | CreateRecipeDto['level']
  ) => {
    if (difficulty === 'EASY' || difficulty === 'easy') return 'Легко';
    if (difficulty === 'MEDIUM' || difficulty === 'medium') return 'Средне';
    if (difficulty === 'HARD' || difficulty === 'hard') return 'Сложно';
    return 'Неизвестно';
  };

  const getDifficultyBadgeClasses = (
    difficulty: Recipe['difficulty'] | CreateRecipeDto['level']
  ) => {
    if (difficulty === 'EASY' || difficulty === 'easy') return 'bg-green-100 text-green-800';
    if (difficulty === 'MEDIUM' || difficulty === 'medium') return 'bg-yellow-100 text-yellow-800';
    if (difficulty === 'HARD' || difficulty === 'hard') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatMinutes = (minutes: number) => {
    if (!minutes || minutes <= 0) return '—';
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
  };

  // Источники времени: у формы allTime/cookTime в минутах, у Recipe prep/cook в секундах
  const totalMinutes = isFormData
    ? (recipe.allTime || 0)
    : Math.round(((recipe.prepTime || 0) + (recipe.cookTime || 0)) / 60);
  const activeMinutes = isFormData
    ? (recipe.cookTime || 0)
    : Math.round((recipe.prepTime || 0) / 60);
  const servingsCount = isFormData ? (recipe.portion || 4) : (recipe.servings || 4);

  const title = isFormData ? recipe.name : recipe.title;
  const difficulty = isFormData ? (recipe.level as any) : (recipe.difficulty as any);

  const CardInner = (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="px-6 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 m-0">{title}</h3>
      </div>

      <div className="px-6 pb-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200">
            <StarIcon className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">Сложность</p>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getDifficultyBadgeClasses(difficulty)}`}>
                {getDifficultyLabel(difficulty)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200">
            <ClockIcon className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">Всего</p>
              <p className="font-medium text-gray-800">{formatMinutes(totalMinutes)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200">
            <ClockIcon className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">Активно</p>
              <p className="font-medium text-gray-800">{formatMinutes(activeMinutes)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200">
            <UserIcon className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">Порций</p>
              <p className="font-medium text-gray-800">{servingsCount}</p>
            </div>
          </div>
        </div>

        {!isFormData && Array.isArray((recipe as Recipe).ingredients) && (recipe as Recipe).ingredients.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h4 className="text-gray-800 mb-3 text-base">Ингредиенты</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(recipe as Recipe).ingredients.slice(0, 8).map((ingredient, idx) => (
                <div key={`${ingredient.id}-${idx}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ingredient.name}</p>
                    <p className="text-xs text-gray-500">{ingredient.count} {ingredient.measure}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h4 className="text-gray-800 mb-3 text-base">Теги</h4>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.slice(0, 10).map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const hasId = !isFormData && (recipe as Recipe).id;

  return (
    <div className={viewMode === 'list' ? 'w-full' : 'w-full'}>
      {hasId ? (
        <Link to={`/recipe/${(recipe as Recipe).id}`} className="no-underline text-inherit">
          {CardInner}
        </Link>
      ) : (
        CardInner
      )}
    </div>
  );
};

export default RecipeCard; 