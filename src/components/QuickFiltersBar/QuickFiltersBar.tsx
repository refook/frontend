import React, { useEffect, useState } from 'react';
import styles from './QuickFiltersBar.module.css';
import type { RecipeFilters, RecipeSort } from '../../types';
import SmartChip from '../Chip/SmartChip';
import type { QuickFilterId } from '../../config/recipeQuickFilters';

interface Props {
  activeFilters: Set<QuickFilterId>;
  filters: RecipeFilters;
  sort: RecipeSort;
  onChange: (selected: Set<QuickFilterId>, next: { filters: RecipeFilters; sort: RecipeSort }) => void;
  ensureVisible?: QuickFilterId[]; // сохранено для совместимости, игнорируется
  ensureCaloriesVisible?: boolean; // показать чип калорий при необходимости
}

const QuickFiltersBar: React.FC<Props> = ({ activeFilters, filters, sort, onChange, ensureVisible, ensureCaloriesVisible }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [caloriesVisible, setCaloriesVisible] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('quickFilters.caloriesVisible');
      if (raw === 'false') return false;
    } catch {}
    return true;
  });
  const [caloriesActive, setCaloriesActive] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('quickFilters.caloriesActive');
      return raw === 'true';
    } catch {}
    return false;
  });

  // Историческая совместимость: ensureVisible больше не используется (чипы удалены)
  useEffect(() => {
    /* no-op */
  }, [ensureVisible]);

  useEffect(() => {
    try {
      localStorage.setItem('quickFilters.caloriesVisible', String(caloriesVisible));
    } catch {}
  }, [caloriesVisible]);

  useEffect(() => {
    try {
      localStorage.setItem('quickFilters.caloriesActive', String(caloriesActive));
    } catch {}
  }, [caloriesActive]);

  // Принудительно показать чип калорий при необходимости (например, после ai-search)
  useEffect(() => {
    if (ensureCaloriesVisible && !caloriesVisible) {
      setCaloriesVisible(true);
    }
  }, [ensureCaloriesVisible]);

  // Убраны остальные чипы; оставлен только чип «Калории»

  return (
    <div>
      <div className={styles.container}>
        <span className={styles.label}>Фильтры:</span>
        {/* Чип калорий как SmartChip c диапазоном */}
        {caloriesVisible && (
        <button
          type="button"
          className={`${styles.smartChipBtn} ${showAdd ? styles.filterBtnRemoveMode : ''} ${caloriesActive ? styles.filterBtnActive : ''}`}
          onClick={() => {
            // Заглушка: в обычном режиме ничего не делаем
            if (showAdd) {
              // В режиме редактирования — скрываем чип с панели
              setCaloriesVisible(false);
            } else {
              // Тогглим активность чипа (только визуально)
              setCaloriesActive((v) => !v);
            }
          }}
          title="Калории"
        >
          <SmartChip
            kind="range"
            title="Калории"
            from={filters.calories?.min}
            to={filters.calories?.max}
            placeholderFrom="от"
            placeholderTo="до"
            removeMode={showAdd}
            onChange={() => { /* заглушка: не фильтруем */ }}
          />
        </button>
        )}
        <button onClick={() => setShowAdd((v) => !v)} className={`ui-btn ui-btn--ghost ${styles.filterBtn} ${styles.addBtn}`}>+ Добавить свой фильтр</button>
      </div>

      {showAdd && (
        <div className={styles.menu}>
          <div className={styles.menuList}>
            {!caloriesVisible && (
              <button
                key="add-calories"
                className={`ui-btn ${styles.menuItem} ${styles.menuItemAdd}`}
                onClick={() => setCaloriesVisible(true)}
              >
                Калории
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickFiltersBar;


