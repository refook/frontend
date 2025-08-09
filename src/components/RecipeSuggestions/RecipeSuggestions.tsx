import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchRecipes } from '../../store/thunks/recipesThunks';
import { RecipeCard } from '../RecipeCard';
import type { Recipe } from '../../types';
import styles from './RecipeSuggestions.module.css';

export const RecipeSuggestions: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: fridgeItems } = useAppSelector(state => state.fridge);
  const { items: recipes, loading } = useAppSelector(state => state.recipes);
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'partial' | 'complete'>('all');

  useEffect(() => {
    dispatch(fetchRecipes({ page: 1, limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (recipes.length > 0 && fridgeItems.length > 0) {
      const filteredRecipes = filterRecipesByIngredients(recipes, fridgeItems, filterType);
      setSuggestions(filteredRecipes);
    } else {
      setSuggestions([]);
    }
  }, [recipes, fridgeItems, filterType]);

  const filterRecipesByIngredients = (
    allRecipes: Recipe[],
    fridgeItems: any[],
    type: 'all' | 'partial' | 'complete'
  ): Recipe[] => {
    const fridgeIngredientNames = fridgeItems.map(item => 
      item.ingredient.name.toLowerCase()
    );

    return allRecipes
      .map(recipe => {
        const recipeIngredients = recipe.ingredients.map(ing => 
          ing.name.toLowerCase()
        );
        
        const matchingIngredients = recipeIngredients.filter(ing => 
          fridgeIngredientNames.includes(ing)
        );
        
        const matchPercentage = (matchingIngredients.length / recipeIngredients.length) * 100;
        
        return {
          ...recipe,
          matchPercentage,
          matchingIngredients: matchingIngredients.length,
          totalIngredients: recipeIngredients.length,
          missingIngredients: recipeIngredients.length - matchingIngredients.length
        };
      })
      .filter(recipe => {
        switch (type) {
          case 'complete':
            return recipe.matchPercentage === 100;
          case 'partial':
            return recipe.matchPercentage > 0 && recipe.matchPercentage < 100;
          default:
            return recipe.matchPercentage > 0;
        }
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 12);
  };

  const getFilterLabel = (type: 'all' | 'partial' | 'complete') => {
    switch (type) {
      case 'complete':
        return 'Все ингредиенты есть';
      case 'partial':
        return 'Частично есть ингредиенты';
      default:
        return 'Все подходящие';
    }
  };

  const getMatchBadge = (recipe: any) => {
    if (recipe.matchPercentage === 100) {
      return <span className={styles.completeBadge}>✅ Все ингредиенты есть</span>;
    } else {
      return (
        <span className={styles.partialBadge}>
          🔶 {recipe.matchingIngredients}/{recipe.totalIngredients} ингредиентов
        </span>
      );
    }
  };

  if (fridgeItems.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🍽️</div>
        <h3>Нет продуктов для подбора рецептов</h3>
        <p>Добавьте продукты в холодильник, чтобы получить персональные рекомендации рецептов</p>
      </div>
    );
  }

  return (
    <div className={styles.recipeSuggestions}>
      <div className={styles.header}>
        <h2>Рецепты для ваших продуктов</h2>
        <p>Найдено {suggestions.length} подходящих рецептов из {fridgeItems.length} продуктов</p>
      </div>

      <div className={styles.filters}>
        {(['all', 'complete', 'partial'] as const).map(type => (
          <button
            key={type}
            className={`${styles.filterButton} ${filterType === type ? styles.active : ''}`}
            onClick={() => setFilterType(type)}
          >
            {getFilterLabel(type)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Ищем подходящие рецепты...</p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>😔</div>
          <h3>Рецепты не найдены</h3>
          <p>Попробуйте изменить фильтр или добавить больше продуктов</p>
        </div>
      ) : (
        <div className={styles.recipesList}>
          {suggestions.map(recipe => (
            <div key={recipe.id} className={styles.recipeItem}>
              <RecipeCard recipe={recipe} />
              <div className={styles.matchInfo}>
                {getMatchBadge(recipe)}
                {(recipe as any).missingIngredients > 0 && (
                  <span className={styles.missingInfo}>
                    Нужно купить: {(recipe as any).missingIngredients} ингредиентов
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 