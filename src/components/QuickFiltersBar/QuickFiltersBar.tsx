import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './QuickFiltersBar.module.css';
import type { RecipeFilters, RecipeSort } from '../../types';
import SmartChip from '../Chip/SmartChip';
import {
  QUICK_FILTERS,
  QUICK_FILTERS_MAP,
  toggleWithGroups,
  DEFAULT_VISIBLE_QUICK_FILTERS
} from '../../config/recipeQuickFilters';
import type { QuickFilterId } from '../../config/recipeQuickFilters';
import { RECIPE_UNITS_ARRAY } from '../../constants/measures';

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
type UIChipId =
  | 'calories'
  | 'difficulty'
  | 'servings'
  | 'tags'
  | 'time'
  | 'totalWeight'
  | 'recipeUnit';

/**
 * Описание одного UI‑чипа панели. Позволяет декларативно задать лейбл
 * и функцию рендера SmartChip, чтобы избежать жёстких связей в компоненте.
 */
interface UIChipDef {
  id: UIChipId;
  label: string;
  isFilled: (filters: RecipeFilters) => boolean;
  clear: (filters: RecipeFilters) => RecipeFilters;
  render: (ctx: {
    filters: RecipeFilters;
    sort: RecipeSort;
    removeMode: boolean;
    active: boolean;
    onFiltersChange: (updater: (prev: RecipeFilters) => RecipeFilters) => void;
    onSortChange: (updater: (prev: RecipeSort) => RecipeSort) => void;
  }) => React.ReactNode;
}

/**
 * Порядок отображения чипов на панели (слева направо, сверху вниз).
 */
const UI_CHIPS_ORDER: UIChipId[] = ['calories', 'difficulty', 'tags', 'time', 'servings', 'totalWeight', 'recipeUnit'];

/**
 * Реестр доступных чипов. Добавьте новый элемент для подключения чипа.
 */
const UI_CHIPS: Record<UIChipId, UIChipDef> = {
  calories: {
    id: 'calories',
    label: 'Калории',
    isFilled: (filters) => typeof filters.calories?.min === 'number' || typeof filters.calories?.max === 'number',
    clear: (filters) => {
      const next: RecipeFilters = { ...filters };
      delete next.calories;
      return next;
    },
    render: ({ filters, removeMode, active, onFiltersChange }) => (
      <SmartChip
        kind="range"
        title="Калории"
        from={filters.calories?.min}
        to={filters.calories?.max}
        placeholderFrom="от"
        placeholderTo="до"
        removeMode={removeMode}
        active={active}
        onChange={({ from, to }) => {
          onFiltersChange((prev) => {
            const next: RecipeFilters = { ...prev };
            const current = { ...(next.calories || {}) };
            if (typeof from === 'number') current.min = from;
            else delete current.min;
            if (typeof to === 'number') current.max = to;
            else delete current.max;
            if (current.min === undefined && current.max === undefined) {
              delete next.calories;
            } else {
              next.calories = current;
            }
            return next;
          });
        }}
      />
    )
  },
  difficulty: {
    id: 'difficulty',
    label: 'Сложность',
    isFilled: (filters) => Array.isArray(filters.difficulty) && filters.difficulty.length > 0,
    clear: (filters) => {
      const next: RecipeFilters = { ...filters };
      delete next.difficulty;
      delete next.level;
      return next;
    },
    render: ({ filters, removeMode, active, onFiltersChange }) => (
      <SmartChip
        kind="select"
        title="Сложность"
        value={(() => {
          const v = filters.difficulty?.[0] ?? filters.level;
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
        onChange={(value) => {
          onFiltersChange((prev) => {
            const next: RecipeFilters = { ...prev };
            if (!value) {
              delete next.difficulty;
              delete next.level;
              return next;
            }
            const normalized = value.toUpperCase();
            if (normalized === 'EASY' || normalized === 'MEDIUM' || normalized === 'HARD') {
              next.difficulty = [normalized as any];
              next.level = normalized as any;
            }
            return next;
          });
        }}
      />
    )
  },
  servings: {
    id: 'servings',
    label: 'Порции',
    isFilled: (filters) => typeof filters.servings?.min === 'number' || typeof filters.servings?.max === 'number',
    clear: (filters) => {
      const next: RecipeFilters = { ...filters };
      delete next.servings;
      delete next.minUnitCount;
      delete next.maxUnitCount;
      return next;
    },
    render: ({ filters, removeMode, active, onFiltersChange }) => (
      <SmartChip
        kind="range"
        title="Порции"
        to={filters.servings?.max}
        placeholderFrom="от"
        placeholderTo="до"
        toOnly
        removeMode={removeMode}
        active={active}
        onChange={({ to }) => {
          onFiltersChange((prev) => {
            const next: RecipeFilters = { ...prev };
            if (typeof to === 'number') {
              next.servings = { ...(next.servings || {}), max: to };
              next.maxUnitCount = to;
            } else {
              if (next.servings) delete next.servings.max;
              delete next.maxUnitCount;
            }
            if (next.servings && next.servings.min === undefined && next.servings.max === undefined) {
              delete next.servings;
            }
            return next;
          });
        }}
      />
    )
  },
  time: {
    id: 'time',
    label: 'Время',
    isFilled: (filters) => typeof filters.cookTime?.max === 'number',
    clear: (filters) => {
      const next: RecipeFilters = { ...filters };
      if (next.cookTime) {
        const copy = { ...next.cookTime };
        delete copy.max;
        if (copy.min === undefined) {
          delete next.cookTime;
        } else {
          next.cookTime = copy;
        }
      }
      delete next.maxTime;
      return next;
    },
    render: ({ filters, removeMode, active, onFiltersChange }) => (
      <SmartChip
        kind="range"
        title="Время (мин)"
        to={filters.cookTime?.max}
        placeholderTo="до"
        toOnly
        removeMode={removeMode}
        active={active}
        onChange={({ to }) => {
          onFiltersChange((prev) => {
            const next: RecipeFilters = { ...prev };
            if (typeof to === 'number') {
              next.cookTime = { ...(next.cookTime || {}), max: to };
            } else if (next.cookTime) {
              const copy = { ...next.cookTime };
              delete copy.max;
              if (copy.min === undefined) {
                delete next.cookTime;
              } else {
                next.cookTime = copy;
              }
            }
            if (typeof to === 'number') {
              next.maxTime = to * 60;
            } else {
              delete next.maxTime;
            }
            return next;
          });
        }}
      />
    )
  },
  tags: {
    id: 'tags',
    label: 'Теги',
    isFilled: (filters) => Array.isArray(filters.tags) && filters.tags.length > 0,
    clear: (filters) => {
      const next: RecipeFilters = { ...filters };
      delete next.tags;
      delete next.tagIds;
      return next;
    },
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
    },
  },
  totalWeight: {
    id: 'totalWeight',
    label: 'Вес блюда',
    isFilled: (filters) =>
      typeof filters.totalWeight?.min === 'number' || typeof filters.totalWeight?.max === 'number',
    clear: (filters) => {
      const next: RecipeFilters = { ...filters };
      delete next.totalWeight;
      delete next.minTotalWeight;
      delete next.maxTotalWeight;
      return next;
    },
    render: ({ filters, removeMode, active, onFiltersChange }) => (
      <SmartChip
        kind="range"
        title="Вес (г)"
        from={filters.totalWeight?.min}
        to={filters.totalWeight?.max}
        placeholderFrom="от"
        placeholderTo="до"
        removeMode={removeMode}
        active={active}
        onChange={({ from, to }) => {
          onFiltersChange((prev) => {
            const next: RecipeFilters = { ...prev };
            const current = { ...(next.totalWeight || {}) };
            if (typeof from === 'number') {
              current.min = from;
              next.minTotalWeight = from;
            } else {
              delete current.min;
              delete next.minTotalWeight;
            }
            if (typeof to === 'number') {
              current.max = to;
              next.maxTotalWeight = to;
            } else {
              delete current.max;
              delete next.maxTotalWeight;
            }
            if (current.min === undefined && current.max === undefined) {
              delete next.totalWeight;
            } else {
              next.totalWeight = current;
            }
            return next;
          });
        }}
      />
    ),
  },
  recipeUnit: {
    id: 'recipeUnit',
    label: 'Единица',
    isFilled: (filters) => typeof filters.recipeUnit === 'string',
    clear: (filters) => {
      const next: RecipeFilters = { ...filters };
      delete next.recipeUnit;
      return next;
    },
    render: ({ filters, removeMode, active, onFiltersChange }) => (
      <SmartChip
        kind="select"
        title="Единица"
        value={filters.recipeUnit ?? ''}
        options={[
          { value: '', label: 'Любая' },
          ...RECIPE_UNITS_ARRAY.map((unit) => ({ value: unit.value, label: unit.label })),
        ]}
        removeMode={removeMode}
        active={active}
        onChange={(value) => {
          onFiltersChange((prev) => {
            const next: RecipeFilters = { ...prev };
            if (!value) {
              delete next.recipeUnit;
            } else {
              next.recipeUnit = value as any;
            }
            return next;
          });
        }}
      />
    ),
  }
};

const INTERACTIVE_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA', 'OPTION']);

const isInteractiveTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (INTERACTIVE_TAGS.has(target.tagName)) return true;
  return Boolean(target.closest('input, select, textarea'));
};

const computeActiveChipIds = (current: RecipeFilters): UIChipId[] =>
  UI_CHIPS_ORDER.filter((id) => UI_CHIPS[id].isFilled(current));

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

  const selectedQuickFilters = useMemo(() => new Set(activeFilters), [activeFilters]);

  const emitChange = useCallback(
    (selected: Set<QuickFilterId>, payload: { filters: RecipeFilters; sort: RecipeSort }) => {
      onChange(selected, payload);
    },
    [onChange]
  );

  const handleFiltersChange = useCallback(
    (updater: (prev: RecipeFilters) => RecipeFilters) => {
      const nextFilters = updater(filters);
      if (nextFilters === filters) return;
      emitChange(new Set(activeFilters), { filters: nextFilters, sort });
    },
    [filters, sort, activeFilters, emitChange]
  );

  const handleSortChange = useCallback(
    (updater: (prev: RecipeSort) => RecipeSort) => {
      const nextSort = updater(sort);
      if (nextSort === sort) return;
      emitChange(new Set(activeFilters), { filters, sort: nextSort });
    },
    [filters, sort, activeFilters, emitChange]
  );

  const handleQuickFilterToggle = useCallback(
    (id: QuickFilterId) => {
      const currentSelection = new Set(activeFilters);
      const definition = QUICK_FILTERS_MAP.get(id);
      if (currentSelection.has(id)) {
        currentSelection.delete(id);
        let nextState = { filters: { ...filters }, sort: { ...sort } };
        if (definition) {
          nextState = definition.remove(nextState);
        }
        emitChange(currentSelection, nextState);
        return;
      }

      const nextSelection = toggleWithGroups(currentSelection, id);
      let nextState = { filters: { ...filters }, sort: { ...sort } };
      for (const removed of currentSelection) {
        if (!nextSelection.has(removed)) {
          const candidate = QUICK_FILTERS_MAP.get(removed);
          if (candidate) {
            nextState = candidate.remove(nextState);
          }
        }
      }
      if (definition) {
        nextState = definition.apply(nextState);
      }
      emitChange(nextSelection, nextState);
    },
    [activeFilters, filters, sort, emitChange]
  );

  const quickFiltersOrdered = useMemo(() => {
    const defaults = new Set(DEFAULT_VISIBLE_QUICK_FILTERS);
    const head = DEFAULT_VISIBLE_QUICK_FILTERS
      .map((id) => QUICK_FILTERS_MAP.get(id))
      .filter((item): item is NonNullable<ReturnType<typeof QUICK_FILTERS_MAP.get>> => Boolean(item));
    const tail = QUICK_FILTERS.filter((item) => !defaults.has(item.id));
    return [...head, ...tail];
  }, []);

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
    const computed = computeActiveChipIds(filters);
    setActiveChips((prev) => {
      if (prev.size === computed.length && computed.every((id) => prev.has(id))) {
        return prev;
      }
      return new Set(computed);
    });
  }, [filters]);

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
    setVisibleChips((prev) => {
      let mutated = false;
      const next = new Set(prev);
      UI_CHIPS_ORDER.forEach((id) => {
        if (UI_CHIPS[id].isFilled(filters) && !next.has(id)) {
          next.add(id);
          mutated = true;
        }
      });
      return mutated ? next : prev;
    });
  }, [filters]);

  const orderedVisible = useMemo(() => UI_CHIPS_ORDER.filter(id => visibleChips.has(id)), [visibleChips]);
  const hidden = useMemo(() => UI_CHIPS_ORDER.filter(id => !visibleChips.has(id)), [visibleChips]);

  return (
    <div>
      {quickFiltersOrdered.length > 0 && (
        <div className={styles.quickFilters}>
          {quickFiltersOrdered.map((filter) => {
            const isActive = selectedQuickFilters.has(filter.id);
            return (
              <button
                key={filter.id}
                type="button"
                className={`${styles.quickFilterBtn} ${isActive ? styles.quickFilterBtnActive : ''}`}
                onClick={() => handleQuickFilterToggle(filter.id)}
                title={filter.description}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      )}

      <div className={styles.container}>
        <span className={styles.label}>Фильтры:</span>
        {orderedVisible.map((id) => (
          <button
            key={id}
            type="button"
            className={styles.smartChipBtn}
            onClick={(event) => {
              if (showAdd) {
                setVisibleChips((prev) => {
                  const next = new Set(prev);
                  next.delete(id);
                  return next;
                });
                return;
              }
              if (isInteractiveTarget(event.target)) {
                return;
              }
              const chip = UI_CHIPS[id];
              if (chip.isFilled(filters)) {
                handleFiltersChange((prev) => chip.clear(prev));
              }
            }}
            title={UI_CHIPS[id].label}
          >
            {UI_CHIPS[id].render({
              filters,
              sort,
              removeMode: showAdd,
              active: activeChips.has(id),
              onFiltersChange: handleFiltersChange,
              onSortChange: handleSortChange,
            })}
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
                onClick={() => setVisibleChips((prev) => new Set(prev).add(id))}
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
