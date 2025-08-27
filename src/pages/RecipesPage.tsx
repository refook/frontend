import React, { useEffect, useMemo, useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useAppDispatch, useAppSelector } from '../store';
import { setPage, setFilters, setSort } from '../store/slices/recipesSlice';
import { QUICK_FILTERS, type QuickFilterId, toggleWithGroups, computeSelection } from '../config/recipeQuickFilters';
import { QuickFiltersBar } from '../components/QuickFiltersBar';
import { fetchRecipes } from '../store/thunks';
import RecipesList from '../components/RecipesList/RecipesList';
import LoadMoreButton from '../components/LoadMoreButton/LoadMoreButton';
import styles from './RecipesPage.module.css';
import { useNavigate } from 'react-router-dom';

const RecipesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading, error, filters, sort, pagination } = useAppSelector(state => state.recipes);
  const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
  const [aiMode, setAiMode] = useState(false);
  const [showAddFilters, setShowAddFilters] = useState(false);

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

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ ...filters, search: searchQuery }));
  };

  const [activeFilters, setActiveFilters] = useState<Set<QuickFilterId>>(new Set());

  const applyQuickFilter = (type: QuickFilterId) => {
    const next = toggleWithGroups(activeFilters, type);
    setActiveFilters(next);
    const applied = computeSelection(next, { filters, sort });
    dispatch(setFilters(applied.filters));
    dispatch(setSort(applied.sort));
  };

  const resultsText = useMemo(() => {
    return `Найдено ${pagination.total} рецептов`;
  }, [pagination.total]);

  return (
    <div className={styles.recipesPage}>
      <div className="container">
        {/* Центрированный заголовок */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitleNew}>Коллекция рецептов</h1>
          <p className={styles.pageSubtitle}>Откройте для себя удивительные рецепты со всего мира.</p>
        </div>

        {/* Поисковая панель с кнопкой ИИ */}
        <form onSubmit={onSubmitSearch} className={styles.searchForm}>
          <div className={`${aiMode ? styles.searchGroupAi : styles.searchGroup}`}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={aiMode ? 'Опишите блюдо, а мы умно подберем фильтры…' : 'Опишите, что хотите приготовить...'}
              className={`ui-input ${styles.searchInput} ${aiMode ? styles.searchInputAi : ''}`}
            />
            <div className={styles.searchActions}>
              <button
                type="button"
                onClick={() => setAiMode(v => !v)}
                className={`${styles.aiToggle} ${aiMode ? styles.aiToggleActive : ''}`}
                aria-label="ИИ поиск"
                title={aiMode ? 'Отключить ИИ поиск' : 'Включить ИИ поиск'}
              >
                <SparklesIcon width={22} height={22} aria-hidden />
              </button>
            </div>
          </div>
        </form>

        {/* Быстрые фильтры */}
        <QuickFiltersBar
          activeFilters={activeFilters}
          filters={filters}
          sort={sort}
          onChange={(selected, applied) => {
            setActiveFilters(selected);
            dispatch(setFilters(applied.filters));
            dispatch(setSort(applied.sort));
          }}
        />

        <div className={styles.resultsBar}>
          <p className={styles.resultsTextNew}>{resultsText}</p>
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
          aiPrompt={aiMode ? searchQuery : undefined}
          onAiFilter={(filter) => {
            if (!filter) return;
            // Применяем фильтр ИИ к redux-фильтрам частично: поисковую строку и, при наличии, сложность/кухню
            const next = { ...filters } as any;
            if (filter?.search) next.search = filter.search;
            if (Array.isArray(filter?.difficulty) && filter.difficulty.length > 0) next.difficulty = filter.difficulty;
            if (Array.isArray(filter?.cuisine) && filter.cuisine.length > 0) next.cuisine = filter.cuisine;
            dispatch(setFilters(next));
          }}
        />

        {pagination.hasMore && (
          <LoadMoreButton
            onClick={loadMoreRecipes}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default RecipesPage; 