import React, { useEffect, useMemo, useState } from 'react';
import styles from './QuickFiltersBar.module.css';
import type { RecipeFilters, RecipeSort } from '../../types';
import SmartChip from '../Chip/SmartChip';
import type { QuickFilterId } from '../../config/recipeQuickFilters';

/**
 * Панель быстрых фильтров (QuickFiltersBar)
 *
 * Компонент визуализирует набор смарт‑чипов (SmartChip) поверх конфигурации.
 * Поддерживает режим редактирования (перенос чипов между активной и скрытой зонами),
 * автопоказ чипов при появлении соответствующих значений в `filters`, и сохраняет
 * набор видимых/активных чипов в localStorage.
 */

/**
 * Пропсы панели быстрых фильтров
 */
interface Props {
  activeFilters: Set<QuickFilterId>;
  filters: RecipeFilters;
  sort: RecipeSort;
  onChange: (selected: Set<QuickFilterId>, next: { filters: RecipeFilters; sort: RecipeSort }) => void;
  ensureVisible?: QuickFilterId[]; // сохранено для совместимости, игнорируется
  ensureCaloriesVisible?: boolean; // показать чип калорий при необходимости
}

// UI-конфигурация чипов (легко расширять добавлением элемента)
/**
 * Идентификаторы UI‑чипов панели.
 * Добавляйте новый id при расширении конфигурации чипов.
 */
type UIChipId = 'calories' | 'difficulty' | 'servings' | 'tags' | 'time';

/**
 * Описание одного UI‑чипа панели. Позволяет декларативно задать лейбл
 * и функцию рендера SmartChip, чтобы избежать жёстких связей в компоненте.
 */
interface UIChipDef {
  id: UIChipId;
  label: string;
  render: (ctx: { filters: RecipeFilters; removeMode: boolean; active: boolean }) => React.ReactNode;
}

/**
 * Порядок отображения чипов на панели (слева направо, сверху вниз).
 */
const UI_CHIPS_ORDER: UIChipId[] = ['calories', 'difficulty', 'tags', 'time', 'servings'];

/**
 * Реестр доступных чипов. Добавьте новый элемент для подключения чипа.
 */
const UI_CHIPS: Record<UIChipId, UIChipDef> = {
  calories: {
    id: 'calories',
    label: 'Калории',
    render: ({ filters, removeMode, active }) => (
      <SmartChip
        kind="range"
        title="Калории"
        from={filters.calories?.min}
        to={filters.calories?.max}
        placeholderFrom="от"
        placeholderTo="до"
        removeMode={removeMode}
        active={active}
        onChange={() => { /* заглушка: не фильтруем */ }}
      />
    )
  },
  difficulty: {
    id: 'difficulty',
    label: 'Сложность',
    render: ({ filters, removeMode, active }) => (
      <SmartChip
        kind="select"
        title="Сложность"
        value={(() => {
          const v = (filters as any)?.difficulty?.[0];
          if (!v) return '';
          const s = String(v).toUpperCase();
          if (s === 'EASY') return 'easy';
          if (s === 'MEDIUM') return 'medium';
          if (s === 'HARD') return 'hard';
          return '';
        })()}
        options={[
          { value: 'easy', label: 'Легко' },
          { value: 'medium', label: 'Средне' },
          { value: 'hard', label: 'Сложно' }
        ]}
        removeMode={removeMode}
        active={active}
        onChange={() => { /* заглушка: не фильтруем */ }}
      />
    )
  },
  servings: {
    id: 'servings',
    label: 'Порции',
    render: ({ filters, removeMode, active }) => (
      <SmartChip
        kind="range"
        title="Порции"
        to={filters.servings?.max}
        placeholderFrom="от"
        placeholderTo="до"
        toOnly
        removeMode={removeMode}
        active={active}
        onChange={() => { /* заглушка: не фильтруем */ }}
      />
    )
  },
  time: {
    id: 'time',
    label: 'Время',
    render: ({ filters, removeMode, active }) => (
      <SmartChip
        kind="range"
        title="Время (мин)"
        to={filters.cookTime?.max}
        placeholderTo="до"
        toOnly
        removeMode={removeMode}
        active={active}
        onChange={() => { /* заглушка: не фильтруем */ }}
      />
    )
  },
  tags: {
    id: 'tags',
    label: 'Теги',
    render: ({ filters, removeMode, active }) => {
      const list = Array.isArray((filters as any)?.tags) ? (filters as any).tags : [];
      if (!list.length) return null;
      return (
        <span>
          {list.map((t: any, idx: number) => {
            const text = (t && typeof t === 'object') ? (t.name ?? t.id ?? '') : String(t ?? '');
            const label = String(text);
            if (!label) return null;
            return (
              <SmartChip
                key={`${label}-${idx}`}
                kind="label"
                text={label}
                title="Тег"
                removeMode={removeMode}
                active={active}
              />
            );
          })}
        </span>
      );
    }
  }
};

/**
 * Компонент панели быстрых фильтров.
 *
 * Управляет:
 * - состоянием режима редактирования (showAdd)
 * - набором видимых чипов (visibleChips) и активных чипов (activeChips),
 *   храня их в localStorage
 * - автопоказом чипов на основе значений в `filters`
 */
const QuickFiltersBar: React.FC<Props> = ({ activeFilters, filters, sort, onChange, ensureVisible, ensureCaloriesVisible }) => {
  const [showAdd, setShowAdd] = useState(false);

  // Набор видимых чипов (редактируется пользователем)
  const [visibleChips, setVisibleChips] = useState<Set<UIChipId>>(() => {
    try {
      const raw = localStorage.getItem('quickFilters.visibleChips');
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        const filtered = parsed.filter((id): id is UIChipId => (UI_CHIPS_ORDER as string[]).includes(id));
        if (filtered.length > 0) return new Set(filtered);
      }
      // миграция со старого ключа
      const legacyVisible = localStorage.getItem('quickFilters.caloriesVisible');
      if (legacyVisible === 'false') return new Set<UIChipId>([]);
    } catch {}
    return new Set<UIChipId>(UI_CHIPS_ORDER);
  });

  // Набор «активных» чипов (только визуальное состояние при не-редактировании)
  const [activeChips, setActiveChips] = useState<Set<UIChipId>>(() => {
    try {
      const raw = localStorage.getItem('quickFilters.activeChips');
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        const filtered = parsed.filter((id): id is UIChipId => (UI_CHIPS_ORDER as string[]).includes(id));
        return new Set(filtered);
      }
      // миграция со старого ключа
      const legacyActive = localStorage.getItem('quickFilters.caloriesActive');
      if (legacyActive === 'true') return new Set<UIChipId>(['calories']);
    } catch {}
    return new Set<UIChipId>();
  });

  // Историческая совместимость: ensureVisible больше не используется (чипы удалены)
  useEffect(() => {
    /* no-op */
  }, [ensureVisible]);

  useEffect(() => {
    try {
      localStorage.setItem('quickFilters.visibleChips', JSON.stringify(Array.from(visibleChips)));
      // поддерживаем совместимость со старым ключом
      localStorage.setItem('quickFilters.caloriesVisible', String(visibleChips.has('calories')));
    } catch {}
  }, [visibleChips]);

  useEffect(() => {
    try {
      localStorage.setItem('quickFilters.activeChips', JSON.stringify(Array.from(activeChips)));
      // поддерживаем совместимость со старым ключом
      localStorage.setItem('quickFilters.caloriesActive', String(activeChips.has('calories')));
    } catch {}
  }, [activeChips]);

  // Принудительно показать чип калорий при необходимости (например, после ai-search)
  useEffect(() => {
    if (ensureCaloriesVisible && !visibleChips.has('calories')) {
      setVisibleChips(prev => {
        const next = new Set(prev);
        next.add('calories');
        return next;
      });
    }
  }, [ensureCaloriesVisible, visibleChips]);

  // Автопоказ чипов на основе значений фильтров (единый эффект)
  useEffect(() => {
    const hasDifficulty = Array.isArray((filters as any)?.difficulty) && (filters as any)?.difficulty?.length > 0;
    const hasCalories = typeof (filters as any)?.calories?.min === 'number' || typeof (filters as any)?.calories?.max === 'number';
    const hasServings = typeof (filters as any)?.servings?.min === 'number' || typeof (filters as any)?.servings?.max === 'number';
    const hasTags = Array.isArray((filters as any)?.tags) && (filters as any)?.tags?.length > 0;
    const hasTime = typeof (filters as any)?.cookTime?.max === 'number';

    setVisibleChips(prev => {
      let mutated = false;
      const next = new Set(prev);
      if (hasDifficulty && !next.has('difficulty')) { next.add('difficulty'); mutated = true; }
      if (hasCalories && !next.has('calories')) { next.add('calories'); mutated = true; }
      if (hasTime && !next.has('time')) { next.add('time'); mutated = true; }
      if (hasServings && !next.has('servings')) { next.add('servings'); mutated = true; }
      if (hasTags && !next.has('tags')) { next.add('tags'); mutated = true; }
      return mutated ? next : prev;
    });
  }, [filters]);

  const orderedVisible = useMemo(() => UI_CHIPS_ORDER.filter(id => visibleChips.has(id)), [visibleChips]);
  const hidden = useMemo(() => UI_CHIPS_ORDER.filter(id => !visibleChips.has(id)), [visibleChips]);

  return (
    <div>
      <div className={styles.container}>
        <span className={styles.label}>Фильтры:</span>
        {orderedVisible.map((id) => (
          <button
            key={id}
            type="button"
            className={`${styles.smartChipBtn}`}
            onClick={() => {
              if (showAdd) {
                setVisibleChips(prev => {
                  const next = new Set(prev);
                  next.delete(id);
                  return next;
                });
              } else {
                setActiveChips(prev => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id); else next.add(id);
                  return next;
                });
              }
            }}
            title={UI_CHIPS[id].label}
          >
            {UI_CHIPS[id].render({ filters, removeMode: showAdd, active: activeChips.has(id) })}
          </button>
        ))}
        <button
          onClick={() => setShowAdd((v) => !v)}
          className={`ui-btn ui-btn--ghost ${styles.filterBtn} ${styles.addBtn}`}
          aria-pressed={showAdd}
          title={showAdd ? 'Выйти из режима редактирования' : 'Войти в режим редактирования'}
        >
          {showAdd ? 'Готово' : '+ Добавить свой фильтр'}
        </button>
      </div>

      {showAdd && (
        <div className={styles.menu}>
          <div className={styles.menuList}>
            {hidden.map((id) => (
              <button
                key={`add-${id}`}
                className={`ui-btn ${styles.menuItem} ${styles.menuItemAdd}`}
                onClick={() => setVisibleChips(prev => new Set(prev).add(id))}
              >
                {UI_CHIPS[id].label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickFiltersBar;


