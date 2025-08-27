import React from 'react';
import type { Recipe } from '../../types';
import RecipeCard from '../RecipeCard/RecipeCard';
import RecipeCardSkeleton from '../RecipeCard/RecipeCardSkeleton';
import styles from './RecipesList.module.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { RecipesService } from '../../services/recipesService';

interface RecipesListProps {
  recipes: Recipe[];
  loading: boolean;
  viewMode?: 'grid' | 'list';
  aiPrompt?: string; // промт для ИИ-поиска
  onAiFilter?: (filter: any) => void; // колбэк для применения фильтра из ответа
}

const RecipesList: React.FC<RecipesListProps> = ({
  recipes,
  loading,
  viewMode = 'grid',
  aiPrompt,
  onAiFilter
}) => {
  const navigate = useNavigate();
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiRecipes, setAiRecipes] = useState<Recipe[] | null>(null);
  const effectiveLoading = loading || aiLoading;

  useEffect(() => {
    let cancelled = false;
    const runAiSearch = async () => {
      if (!aiPrompt || aiPrompt.trim().length < 3) {
        setAiRecipes(null);
        return;
      }
      setAiLoading(true);
      try {
        const { filter, recipes } = await RecipesService.aiSearchRecipes(aiPrompt.trim());
        if (!cancelled) {
          setAiRecipes(recipes);
          onAiFilter && onAiFilter(filter);
        }
      } catch (e) {
        if (!cancelled) {
          setAiRecipes([]);
        }
        // eslint-disable-next-line no-console
        console.error('Ошибка ИИ-поиска:', e);
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    };
    runAiSearch();
    return () => { cancelled = true; };
  }, [aiPrompt, onAiFilter]);

  const handleRandomRecipe = () => {
    if (!recipes || recipes.length === 0) return;
    const random = recipes[Math.floor(Math.random() * recipes.length)];
    if (random?.id) {
      navigate(`/recipe/${random.id}`);
    }
  };
  if (effectiveLoading && (aiRecipes == null ? recipes.length === 0 : aiRecipes.length === 0)) {
    return (
      <div className={`${styles.recipesList} ${styles[viewMode]}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const dataSource = aiRecipes ?? recipes;
  if (dataSource.length === 0) {
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

  // Рендерим карточки по 3 в ряд и добавляем баннер после каждой 3-й строки
  const elements: React.ReactNode[] = [];
  let rowIndex = 0;

  dataSource.forEach((recipe, index) => {
    elements.push(
      <RecipeCard
        key={recipe.id}
        recipe={recipe}
        viewMode={viewMode}
      />
    );

    const isRowEnd = (index % 3) === 2; // каждые 3 карточки
    if (isRowEnd) {
      rowIndex += 1;
      if (rowIndex % 3 === 0) {
        elements.push(
          <div key={`banner-${rowIndex}`} className={`${styles.fullWidth}`}>
            <div className={styles.banner}>
              <div className={styles.bannerContent}>
                <div>
                  <h3 className={styles.bannerTitle}>Нужна идея? Попробуйте случайный рецепт</h3>
                  <p className={styles.bannerSubtitle}>Мы подберем рецепт из текущей выборки</p>
                </div>
                <button onClick={handleRandomRecipe} className={styles.bannerButton}>Случайный рецепт</button>
              </div>
            </div>
          </div>
        );
      }
    }
  });

  return (
    <div className={`${styles.recipesList} ${styles[viewMode]}`}>
      {elements}
      {effectiveLoading && (
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