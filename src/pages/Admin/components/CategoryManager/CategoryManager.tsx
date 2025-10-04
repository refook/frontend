import React, { useCallback, useEffect } from 'react';
import EditableTable, { type EditableRow } from '../EditableTable/EditableTable';
import { useAdminNamedEntities } from '../../hooks/useAdminNamedEntities';
import { CategoriesService } from '../../../../services/categoriesService';
import type { CategoryResponseDto } from '../../../../types/category.types';
import styles from '../TagManager/TagManager.module.css';

const CategoryManager: React.FC = () => {
  const getAll = useCallback((options?: { force?: boolean }) => CategoriesService.getAll(options), []);
  const searchCategories = useCallback((value: string) => CategoriesService.search(value), []);
  const updateCategory = useCallback((id: string, name: string) => CategoriesService.update(id, name), []);

  const { items, loading, error, query, editing, updatingId, setEditing, refresh, handleQueryChange, save } =
    useAdminNamedEntities<CategoryResponseDto>({
      getAll,
      search: searchCategories,
      update: updateCategory,
    });

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCopyId = useCallback(async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      console.error('Не удалось скопировать ID');
    }
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <input
          className={styles.input}
          type="text"
          placeholder="Поиск категорий (мин. 3 символа)"
          value={query}
          onChange={(e) => {
            void handleQueryChange(e.target.value);
          }}
        />
        <button className="ui-btn" onClick={() => refresh({ force: true })} disabled={loading}>
          Обновить
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <EditableTable
        rows={items as unknown as EditableRow[]}
        editing={editing}
        setEditing={(updater) => setEditing((prev) => updater(prev))}
        updatingId={updatingId}
        onSave={(id) => { void save(id); }}
        loading={loading}
        emptyText="Категории не найдены"
        enableCopyId
        onCopyId={(id) => { void handleCopyId(id); }}
      />
    </div>
  );
};

export default CategoryManager;
