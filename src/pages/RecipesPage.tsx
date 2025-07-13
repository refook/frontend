import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setPage } from '../store/slices/recipesSlice';
import { fetchRecipes } from '../store/thunks';
import FiltersPanel from '../components/FiltersPanel/FiltersPanel';
import RecipesList from '../components/RecipesList/RecipesList';
import LoadMoreButton from '../components/LoadMoreButton/LoadMoreButton';
import styles from './RecipesPage.module.css';

const RecipesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, filters, sort, pagination } = useAppSelector(state => state.recipes);
  const [showFilters, setShowFilters] = useState(false);

  // Загружаем рецепты при изменении фильтров или сортировки
  useEffect(() => {
    dispatch(fetchRecipes({
      page: pagination.page,
      limit: pagination.limit,
      filters,
      sort
    }));
  }, [dispatch, filters, sort, pagination.page]);

  const loadMoreRecipes = () => {
    const nextPage = pagination.page + 1;
    dispatch(setPage(nextPage));
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className={styles.recipesPage}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Все рецепты</h1>
          <button 
            className={styles.filtersToggle}
            onClick={toggleFilters}
          >
            <span className={styles.filterIcon}>⚙️</span>
            Фильтры
          </button>
        </div>

        <div className={styles.content}>
          <FiltersPanel 
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
          />
          
          <div className={styles.mainContent}>
            <div className={styles.resultsHeader}>
              <p className={styles.resultsCount}>
                Найдено {pagination.total} рецептов
              </p>
              <div className={styles.viewToggle}>
                <button className={`${styles.viewButton} ${styles.active}`}>
                  <span>📋</span>
                </button>
                <button className={styles.viewButton}>
                  <span>🔳</span>
                </button>
              </div>
            </div>

            {error && (
              <div className={styles.error}>
                <p>Ошибка загрузки рецептов: {error}</p>
                <button 
                  onClick={() => dispatch(fetchRecipes({ page: 1, limit: pagination.limit, filters, sort }))} 
                  className={styles.retryButton}
                >
                  Попробовать снова
                </button>
              </div>
            )}

            <RecipesList 
              recipes={items}
              loading={loading}
            />

            {pagination.hasMore && (
              <LoadMoreButton 
                onClick={loadMoreRecipes}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipesPage; 