import React, { useEffect, useState } from 'react';
import styles from './QuickFiltersBar.module.css';
import { QUICK_FILTERS, DEFAULT_VISIBLE_QUICK_FILTERS, type QuickFilterId, computeSelection, toggleWithGroups } from '../../config/recipeQuickFilters';
import type { RecipeFilters, RecipeSort } from '../../types';

interface Props {
  activeFilters: Set<QuickFilterId>;
  filters: RecipeFilters;
  sort: RecipeSort;
  onChange: (selected: Set<QuickFilterId>, next: { filters: RecipeFilters; sort: RecipeSort }) => void;
}

const QuickFiltersBar: React.FC<Props> = ({ activeFilters, filters, sort, onChange }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [visible, setVisible] = useState<Set<QuickFilterId>>(() => {
    try {
      const raw = localStorage.getItem('quickFilters.visible');
      if (raw) {
        const arr = JSON.parse(raw) as QuickFilterId[];
        const validIds = new Set(QUICK_FILTERS.map(f => f.id));
        return new Set(arr.filter((id) => validIds.has(id)));
      }
    } catch {}
    return new Set(DEFAULT_VISIBLE_QUICK_FILTERS);
  });

  useEffect(() => {
    try {
      localStorage.setItem('quickFilters.visible', JSON.stringify(Array.from(visible)));
    } catch {}
  }, [visible]);

  const handleToggle = (id: QuickFilterId) => {
    // В обычном режиме кликом переключаем активность
    const next = toggleWithGroups(activeFilters, id);
    const applied = computeSelection(next, { filters, sort });
    onChange(next, applied);
  };

  const handleMainClick = (id: QuickFilterId) => {
    if (showAdd) {
      // В режиме редактирования (открыто меню) — кликом по кнопке убираем её с панели
      const nextVisible = new Set(visible);
      nextVisible.delete(id);
      setVisible(nextVisible);
      return;
    }
    handleToggle(id);
  };

  const handleAdd = (id: QuickFilterId) => {
    // Добавляем кнопку в панель (без изменения активных фильтров)
    const nextVisible = new Set(visible);
    nextVisible.add(id);
    setVisible(nextVisible);
  };

  return (
    <div>
      <div className={styles.container}>
        <span className={styles.label}>Фильтры:</span>
        {QUICK_FILTERS.filter(qf => visible.has(qf.id)).map((qf) => (
          <button
            key={qf.id}
            onClick={() => handleMainClick(qf.id)}
            className={`ui-btn ui-btn--ghost ${styles.filterBtn} ${activeFilters.has(qf.id) ? styles.filterBtnActive : ''} ${showAdd ? styles.filterBtnRemoveMode : ''}`}
          >
            {qf.label}
          </button>
        ))}
        <button onClick={() => setShowAdd((v) => !v)} className={`ui-btn ui-btn--ghost ${styles.filterBtn} ${styles.addBtn}`}>+ Добавить свой фильтр</button>
      </div>

      {showAdd && (
        <div className={styles.menu}>
          <div className={styles.menuList}>
            {/* Показываем только те, которых нет на панели и не активны */}
            {QUICK_FILTERS.filter(qf => !visible.has(qf.id) && !activeFilters.has(qf.id)).map((qf) => (
              <button
                key={`add-${qf.id}`}
                className={`ui-btn ${styles.menuItem} ${styles.menuItemAdd}`}
                onClick={() => handleAdd(qf.id)}
              >
                {qf.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickFiltersBar;


