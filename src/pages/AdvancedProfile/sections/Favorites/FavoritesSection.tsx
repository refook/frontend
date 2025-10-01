import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import styles from './FavoritesSection.module.css';
import SectionHeader from '../../components/SectionHeader';
import RecipeCard from '../../../../components/RecipeCard/RecipeCard';
import { RecipesService } from '../../../../services/recipesService';
import type { Recipe } from '../../../../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { KeycloakContext } from '../../../../providers/KeycloakProvider';

/**
 * Секция «Избранные рецепты» с полным функционалом закладок (группы):
 * - создание, переименование, удаление групп
 * - добавление рецептов в активную группу
 * - перенос рецептов между группами и удаление из группы
 * - автосохранение групп в localStorage
 *
 * Источник рецептов для выбора — заглушка `initialRecipes` (тип `Recipe[]`).
 *
 * Тип группы:
 * @property {string} id Идентификатор группы
 * @property {string} name Название группы
 * @property {Recipe[]} recipes Рецепты в группе
 */
const FavoritesSection: React.FC = () => {
  type FavoriteGroup = { id: string; name: string; recipes: Recipe[] };
  const STORAGE_KEY = 'refook_favorites_groups_v1';

  const [groups, setGroups] = useState<FavoriteGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<Record<string, boolean>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Инициализация из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: FavoriteGroup[] = JSON.parse(saved);
        setGroups(parsed.map(g => {
          if (g.id === 'all') {
            return { ...g, name: g.name === 'All' ? 'Все' : g.name || 'Все' };
          }
          if (g.id === 'desserts') {
            return { ...g, name: g.name === 'Desserts' ? 'Десерты' : g.name || 'Десерты' };
          }
          return g;
        }));
      } else {
        const starter: FavoriteGroup[] = [
          { id: 'all', name: 'Все', recipes: [] },
          { id: 'desserts', name: 'Десерты', recipes: [] }
        ];
        setGroups(starter);
      }
    } catch {
      setGroups([{ id: 'all', name: 'Все', recipes: [] }]);
    }
  }, []);

  // Автосохранение
  const storageDisabledRef = useRef(false);

  useEffect(() => {
    if (storageDisabledRef.current) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    } catch (error) {
      const quotaOverflow = error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22);
      if (quotaOverflow) {
        storageDisabledRef.current = true;
        console.warn('Сохранение избранных групп в localStorage отключено: превышена квота');
        return;
      }
      console.warn('Не удалось сохранить данные избранных групп в localStorage:', error);
    }
  }, [groups]);

  const activeGroup = useMemo(() => groups.find(g => g.id === activeGroupId) || groups[0], [groups, activeGroupId]);

  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);

  // Загружаем избранные рецепты пользователя по токену после инициализации/аутентификации
  const keycloakCtx = useContext(KeycloakContext);
  useEffect(() => {
    let isMounted = true;
    if (!keycloakCtx?.isInitialized) return; // ждём инициализации
    if (!keycloakCtx?.authenticated) {
      setAvailableRecipes([]);
      return;
    }
    (async () => {
      try {
        console.log('[Favorites] loading favorites...');
        const favorites = await RecipesService.getFavorites();
        console.log('[Favorites] loaded:', favorites?.length);
        if (isMounted) setAvailableRecipes(favorites || []);
      } catch {
        console.warn('[Favorites] failed to load');
        if (isMounted) setAvailableRecipes([]);
      }
    })();
    return () => { isMounted = false; };
  }, [keycloakCtx?.isInitialized, keycloakCtx?.authenticated]);

  const allKnownRecipes: Recipe[] = useMemo(() => availableRecipes, [availableRecipes]);

  // После загрузки избранного — заполняем группу "Все" для отображения карточек
  useEffect(() => {
    if (!availableRecipes) return;
    setGroups(prev => {
      if (!prev || prev.length === 0) {
        return [
          { id: 'all', name: 'Все', recipes: availableRecipes },
          { id: 'desserts', name: 'Десерты', recipes: [] }
        ];
      }
      const hasAll = prev.some(g => g.id === 'all');
      if (!hasAll) {
        return [{ id: 'all', name: 'Все', recipes: availableRecipes }, ...prev];
      }
      return prev.map(g => g.id === 'all' ? { ...g, recipes: availableRecipes, name: g.name === 'All' ? 'Все' : g.name || 'Все' } : g);
    });
  }, [availableRecipes]);

  // Статистика по активной группе
  const totalLikes = useMemo(() => (activeGroup?.recipes || []).reduce((sum, r) => sum + (r.stats?.likes ?? 0), 0), [activeGroup]);

  // Действия: открытия модального окна добавления
  const openAddModal = () => { setSelectedToAdd({}); setIsAddModalOpen(true); };
  const closeAddModal = () => setIsAddModalOpen(false);
  const toggleSelectRecipe = (id: string) => setSelectedToAdd(prev => ({ ...prev, [id]: !prev[id] }));

  const addSelectedRecipes = () => {
    const ids = Object.keys(selectedToAdd).filter(k => selectedToAdd[k]);
    if (ids.length === 0) return closeAddModal();
    const recipesToAdd = allKnownRecipes.filter(r => ids.includes(r.id));
    setGroups(prev => prev.map(g => {
      if (g.id === activeGroupId) {
        const existingIds = new Set(g.recipes.map(r => r.id));
        const merged = [...g.recipes, ...recipesToAdd.filter(r => !existingIds.has(r.id))];
        return { ...g, recipes: merged };
      }
      return g;
    }));
    closeAddModal();
  };

  const removeFromGroup = (recipeId: string, groupId: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, recipes: g.recipes.filter(r => r.id !== recipeId) } : g));
  };

  const moveToGroup = (recipeId: string, fromGroupId: string, toGroupId: string) => {
    if (fromGroupId === toGroupId) return;
    setGroups(prev => prev.map(g => {
      if (g.id === fromGroupId) {
        return { ...g, recipes: g.recipes.filter(r => r.id !== recipeId) };
      }
      if (g.id === toGroupId) {
        const sourceGroup = prev.find(sg => sg.id === fromGroupId);
        const recipe = sourceGroup?.recipes.find(r => r.id === recipeId);
        if (recipe && !g.recipes.some(r => r.id === recipeId)) {
          return { ...g, recipes: [...g.recipes, recipe] };
        }
      }
      return g;
    }));
  };

  const createGroup = () => {
    const name = prompt('Название новой группы:');
    if (!name) return;
    const id = `group-${Date.now()}`;
    setGroups(prev => [...prev, { id, name, recipes: [] }]);
    setActiveGroupId(id);
  };

  const renameGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    const name = prompt('Переименовать группу:', group.name);
    if (!name) return;
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name } : g));
  };

  const deleteGroup = (groupId: string) => {
    if (groupId === 'all') return alert('Невозможно удалить группу "Все"');
    if (!confirm('Удалить эту группу? (Рецепты останутся в других группах)')) return;
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setActiveGroupId('all');
  };

  // Закрытие меню по клику вне
  useEffect(() => {
    if (!isSettingsOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.(`.${styles.groupActions}`)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [isSettingsOpen]);

  return (
    <div className={styles.wrapper}>
      <SectionHeader
        title="Избранные рецепты"
        description="Управляйте сохранёнными рецептами с помощью групп"
        stats={[{ label: 'Лайки', value: totalLikes, tone: 'accent' }]}
        actionLabel="ДОБАВИТЬ РЕЦЕПТЫ"
        onActionClick={openAddModal}
        actionVariant="ghost"
      />

      <div className={styles.groupsBar}>
        {groups.map(group => (
          <button
            key={group.id}
            className={`${styles.groupPill} ${group.id === activeGroupId ? styles.groupPillActive : ''}`}
            onClick={() => setActiveGroupId(group.id)}
          >
            {group.id === activeGroupId && group.id !== 'all' ? (
              <span
                className={`${styles.groupName} ${styles.groupNameEditable}`}
                onClick={(e) => { e.stopPropagation(); renameGroup(group.id); }}
                title="Переименовать группу"
              >
                {group.name}
              </span>
            ) : (
              <span className={styles.groupName}>{group.name}</span>
            )}
            <span className={styles.groupCount}>{group.recipes.length}</span>
            {group.id === activeGroupId && group.id !== 'all' && (
              <span className={styles.groupActions}>
                <button
                  type="button"
                  className={styles.groupIconBtn}
                  onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(v => !v); }}
                  aria-label={`Настройки ${group.name}`}
                >
                  <EllipsisHorizontalIcon className={styles.groupIcon} />
                </button>
                {isSettingsOpen && (
                  <div className={styles.groupMenu} role="menu">
                    <button
                      type="button"
                      className={styles.groupMenuItem}
                      onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(false); renameGroup(group.id); }}
                    >
                      Переименовать
                    </button>
                    <button
                      type="button"
                      className={`${styles.groupMenuItem} ${styles.groupMenuItemDanger}`}
                      onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(false); deleteGroup(group.id); }}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </span>
            )}
          </button>
        ))}
        <button className={styles.groupPill} onClick={createGroup} aria-label="Новая группа">


            <span className={styles.groupIconBtn} aria-hidden>
              <PlusIcon className={styles.groupIcon} />
            </span>

        </button>
      </div>

      <div className={styles.grid}>
        {(activeGroup?.recipes || []).map((recipe) => (
          <div key={recipe.id} className={styles.recipeItem}>
            <RecipeCard recipe={recipe} />
            <div className={styles.recipeActions}>
              <select
                className={styles.select}
                value=""
                onChange={(e) => { const to = e.target.value; if (to) moveToGroup(recipe.id, activeGroup.id, to); }}
              >
                <option value="" disabled>Переместить в…</option>
                {groups.filter(g => g.id !== activeGroup.id).map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <button className="ui-btn" onClick={() => removeFromGroup(recipe.id, activeGroup.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Добавить рецепты</h3>
            </div>
            <div className={styles.modalBody}>
              {allKnownRecipes.length === 0 ? (
                <p className={styles.muted}>Нет рецептов для добавления</p>
              ) : (
                <div className={styles.recipesSelectable}>
                  {allKnownRecipes.map(r => (
                    <label key={r.id} className={styles.selectableItem}>
                      <input
                        type="checkbox"
                        checked={!!selectedToAdd[r.id]}
                        onChange={() => toggleSelectRecipe(r.id)}
                      />
                      <span className={styles.selectableTitle}>{r.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className="ui-btn" onClick={closeAddModal}>Отмена</button>
              <button className="ui-btn ui-btn--primary" onClick={addSelectedRecipes}>Добавить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;

