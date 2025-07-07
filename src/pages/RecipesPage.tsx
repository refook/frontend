import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchRecipesStart, fetchRecipesSuccess, setPage } from '../store/slices/recipesSlice';
import FiltersPanel from '../components/FiltersPanel/FiltersPanel';
import RecipesList from '../components/RecipesList/RecipesList';
import LoadMoreButton from '../components/LoadMoreButton/LoadMoreButton';
import styles from './RecipesPage.module.css';

const RecipesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, filters, sort, pagination } = useAppSelector(state => state.recipes);
  const [showFilters, setShowFilters] = useState(false);

  // Временно отключаем автоматическую генерацию мок-данных.
  // Реальные рецепты добавляются через конструктор и уже находятся в Redux-хранилище.

  // Пример будущей загрузки из API:
  // useEffect(() => {
  //   dispatch(fetchRecipesStart());
  //   api.get('/recipes').then(res => dispatch(fetchRecipesSuccess(res.data)));  
  // }, [filters, sort]);

  const loadMoreRecipes = () => {
    // Здесь будет пагинация при подключении к API
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
                <button onClick={loadMoreRecipes} className={styles.retryButton}>
                  Попробовать снова
                </button>
              </div>
            )}

            <RecipesList 
              recipes={items}
              loading={loading}
            />

            {/* Пока пагинация не используется, убираем кнопку «Показать ещё», если рецептов меньше лимита */}
            <LoadMoreButton 
              onClick={loadMoreRecipes}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipesPage; 