import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../../types';
import RecipeCard from '../RecipeCard/RecipeCard';
import RecipeCardSkeleton from '../RecipeCard/RecipeCardSkeleton';
import ListPaginationControls from '../ListPaginationControls/ListPaginationControls';
import styles from './RecipesList.module.css';

interface RecipesListProps {
  recipes: Recipe[];
  loading: boolean;
  viewMode?: 'grid' | 'list';
  overrideRecipes?: Recipe[] | null; // данные из ИИ-поиска
  loadingOverride?: boolean; // внешний индикатор загрузки
  enablePagination?: boolean;
  pageSize?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadMoreLabel?: string;
  finishedLabel?: string;
  totalCount?: number;
  footerSummary?: string;
  footerNote?: string;
}

const RecipesList: React.FC<RecipesListProps> = ({
  recipes,
  loading,
  viewMode = 'grid',
  overrideRecipes,
  loadingOverride,
  enablePagination = false,
  pageSize = 12,
  hasMore,
  onLoadMore,
  loadMoreLabel = 'Показать больше',
  finishedLabel = 'Больше нет элементов',
  totalCount,
  footerSummary,
  footerNote
}) => {
  const navigate = useNavigate();
  const effectiveLoading = loadingOverride ?? loading;
  const dataSource = overrideRecipes ?? recipes;

  const [perPage, setPerPage] = useState(() => {
    try {
      const raw = localStorage.getItem('recipesList.perPage');
      const n = raw ? Number.parseInt(raw, 10) : NaN;
      return Number.isFinite(n) && n > 0 ? n : pageSize;
    } catch {
      return pageSize;
    }
  });
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const shouldUseLocalPagination = enablePagination && !onLoadMore;

  const displayedRecipes = useMemo(() => (
    enablePagination ? dataSource.slice(0, visibleCount) : dataSource
  ), [dataSource, visibleCount, enablePagination]);

  // Не сбрасываем видимое количество при обновлении данных, чтобы избежать мерцаний.
  // Обновляем только при смене perPage или переключении режима пагинации.
  useEffect(() => {
    if (!enablePagination) return;
    setVisibleCount(perPage);
  }, [enablePagination, perPage]);

  // Сохраняем perPage локально
  useEffect(() => {
    try {
      if (enablePagination) {
        localStorage.setItem('recipesList.perPage', String(perPage));
      }
    } catch {}
  }, [perPage, enablePagination]);

  const internalHasMore = enablePagination ? visibleCount < dataSource.length : false;
  const effectiveHasMore = useMemo(() => {
    if (!enablePagination) return false;
    // Если известен общий счётчик — это главный источник истины
    if (typeof totalCount === 'number') return displayedRecipes.length < totalCount;
    // Иначе используем флаг hasMore, если он передан явно
    if (typeof hasMore === 'boolean') return hasMore;
    // Для локальной пагинации опираемся на видимое количество
    if (shouldUseLocalPagination) return internalHasMore;
    // Для внешней пагинации без totalCount/hasMore оставляем кнопку активной
    if (onLoadMore) return true;
    return false;
  }, [enablePagination, totalCount, displayedRecipes.length, hasMore, shouldUseLocalPagination, internalHasMore, onLoadMore]);

  const loadMoreHandler = useCallback(() => {
    if (!enablePagination) return;
    // Всегда увеличиваем видимый лимит на perPage
    setVisibleCount(prev => {
      const hardLimit = typeof totalCount === 'number' ? totalCount : dataSource.length;
      const next = prev + perPage;
      return hardLimit ? Math.min(next, hardLimit) : next;
    });
    // При внешней пагинации дергаем загрузчик
    if (onLoadMore) {
      onLoadMore();
    }
  }, [enablePagination, onLoadMore, perPage, dataSource.length, totalCount]);

  const totalItems = useMemo(() => {
    if (typeof totalCount === 'number') {
      return totalCount;
    }
    if (shouldUseLocalPagination) {
      return dataSource.length;
    }
    return undefined;
  }, [totalCount, shouldUseLocalPagination, dataSource.length]);

  const summaryText = useMemo(() => {
    if (!enablePagination) return null;
    if (footerSummary) return footerSummary;
    if (typeof totalItems === 'number') {
      return `Показано ${displayedRecipes.length} из ${totalItems}`;
    }
    return `Показано ${displayedRecipes.length}`;
  }, [enablePagination, footerSummary, totalItems, displayedRecipes.length]);

  const handleRandomRecipe = () => {
    if (!dataSource || dataSource.length === 0) return;
    const random = dataSource[Math.floor(Math.random() * dataSource.length)];
    if (random?.id) {
      navigate(`/recipe/${random.id}`);
    }
  };

  const isInitialLoading = effectiveLoading && displayedRecipes.length === 0;
  const isEmptyState = !effectiveLoading && displayedRecipes.length === 0;

  if (isInitialLoading) {
    return (
      <div className={`${styles.recipesList} ${styles[viewMode]}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isEmptyState) {
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

  displayedRecipes.forEach((recipe, index) => {
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
      {effectiveLoading && onLoadMore && (
        <>
          {Array.from({ length: 6 }).map((_, index) => (
            <RecipeCardSkeleton key={`skeleton-${index}`} />
          ))}
        </>
      )}
      {enablePagination && (
        <div className={`${styles.fullWidth} ${styles.paginationContainer}`}>
          <ListPaginationControls
            summary={summaryText}
            hasMore={effectiveHasMore}
            loading={effectiveLoading && Boolean(onLoadMore)}
            onLoadMore={loadMoreHandler}
            buttonLabel={loadMoreLabel}
            finishedLabel={finishedLabel}
            note={footerNote}
            perPageValue={enablePagination ? perPage : undefined}
            onPerPageChange={enablePagination ? setPerPage : undefined}
            perPageLabel="Показывать по"
          />
        </div>
      )}
    </div>
  );
};

export default RecipesList;
