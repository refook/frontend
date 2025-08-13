import React, { useEffect, useMemo, useState } from 'react';
import styles from './FavoritesPage.module.css';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import type { Recipe } from '../types';
import { initialRecipes } from '../data/initialRecipes';
import { PlusIcon, PencilSquareIcon, TrashIcon, Squares2X2Icon, ListBulletIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

type FavoriteGroup = {
  id: string;
  name: string;
  recipes: Recipe[];
};

const STORAGE_KEY = 'refook_favorites_groups_v1';

const FavoritesPage: React.FC = () => {
  const [groups, setGroups] = useState<FavoriteGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedToAdd, setSelectedToAdd] = useState<Record<string, boolean>>({});

  // Инициализация из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setGroups(JSON.parse(saved));
      } else {
        // Стартовые группы
        const starter: FavoriteGroup[] = [
          { id: 'all', name: 'Все', recipes: [] },
          { id: 'desserts', name: 'Десерты', recipes: [] },
        ];
        setGroups(starter);
      }
    } catch {
      setGroups([{ id: 'all', name: 'Все', recipes: [] }]);
    }
  }, []);

  // Автосохранение
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  const activeGroup = useMemo(() => groups.find(g => g.id === activeGroupId) || groups[0], [groups, activeGroupId]);

  const allKnownRecipes: Recipe[] = useMemo(() => {
    // Для заглушки показываем initialRecipes как доступные к добавлению
    return initialRecipes as unknown as Recipe[];
  }, []);

  const openAddModal = () => {
    setSelectedToAdd({});
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const toggleSelectRecipe = (id: string) => {
    setSelectedToAdd(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
    const name = prompt('Новое название группы:', group.name);
    if (!name) return;
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name } : g));
  };

  const deleteGroup = (groupId: string) => {
    if (groupId === 'all') return alert('Нельзя удалить группу «Все»');
    if (!confirm('Удалить группу и рецепты в ней (из групп)?')) return;
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setActiveGroupId('all');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Избранное</h1>
        <div className={styles.headerActions}>
          <button className="ui-btn" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <ListBulletIcon className={styles.icon} /> : <Squares2X2Icon className={styles.icon} />}
            {viewMode === 'grid' ? 'Список' : 'Сетка'}
          </button>
          <button className="ui-btn ui-btn--primary" onClick={createGroup}>
            <PlusIcon className={styles.icon} />
            Новая группа
          </button>
          <button className="ui-btn" onClick={openAddModal}>
            <ArrowDownTrayIcon className={styles.icon} />
            Добавить рецепты
          </button>
        </div>
      </div>

      <div className={styles.groupsBar}>
        {groups.map(group => (
          <button
            key={group.id}
            className={`${styles.groupPill} ${group.id === activeGroupId ? styles.groupPillActive : ''}`}
            onClick={() => setActiveGroupId(group.id)}
          >
            <span className={styles.groupName}>{group.name}</span>
            <span className={styles.groupCount}>{group.recipes.length}</span>
            {group.id !== 'all' && (
              <span className={styles.groupActions}>
                <PencilSquareIcon className={styles.groupIcon} onClick={(e) => { e.stopPropagation(); renameGroup(group.id); }} />
                <TrashIcon className={styles.groupIcon} onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }} />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={viewMode === 'grid' ? styles.grid : styles.list}>
        {(activeGroup?.recipes || []).map((recipe) => (
          <div key={recipe.id} className={styles.recipeItem}>
            <RecipeCard recipe={recipe} viewMode={viewMode} />
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
                <p className={styles.muted}>Нет доступных рецептов для добавления</p>
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

export default FavoritesPage;


