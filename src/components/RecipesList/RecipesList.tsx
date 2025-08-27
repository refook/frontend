import React from 'react';
import type { Recipe } from '../../types';
import RecipeCard from '../RecipeCard/RecipeCard';
import RecipeCardSkeleton from '../RecipeCard/RecipeCardSkeleton';
import styles from './RecipesList.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface RecipesListProps {
  recipes: Recipe[];
  loading: boolean;
  viewMode?: 'grid' | 'list';
  overrideRecipes?: Recipe[] | null; // данные из ИИ-поиска
  loadingOverride?: boolean; // внешний индикатор загрузки
}

const RecipesList: React.FC<RecipesListProps> = ({
  recipes,
  loading,
  viewMode = 'grid',
  overrideRecipes,
  loadingOverride
}) => {
  const navigate = useNavigate();
  const effectiveLoading = loadingOverride ?? loading;

  const handleRandomRecipe = () => {
    if (!recipes || recipes.length === 0) return;
    const random = recipes[Math.floor(Math.random() * recipes.length)];
    if (random?.id) {
      navigate(`/recipe/${random.id}`);
    }
  };
  const dataSource = overrideRecipes ?? recipes;
  if (effectiveLoading && dataSource.length === 0) {
    return (
      <div className={`${styles.recipesList} ${styles[viewMode]}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

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