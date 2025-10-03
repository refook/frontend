import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../../../services/api';
import styles from './TagManager.module.css';
import EditableTable, { type EditableRow } from '../EditableTable/EditableTable';
import { getAuthHeaders, authorizedFetch } from '../../../../services/auth';
import type { TagResponseDto } from '../../../../types/recipe.types';
import { tagsService } from '../../../../services/tagsService';

interface UpdateTagDto { name: string; }

const TagManager: React.FC = () => {
  const [tags, setTags] = useState<TagResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const headers = useMemo(() => getAuthHeaders(), []);

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      console.error('Не удалось скопировать ID');
    }
  };

  const fetchAll = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await tagsService.getAll({ force });
      setTags(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить теги';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const search = async (name: string) => {
    if (!name || name.length < 3) {
      await fetchAll();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authorizedFetch(`${API_BASE_URL}/tags/search?name=${encodeURIComponent(name)}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: unknown = await res.json();
      setTags(Array.isArray(data) ? (data as TagResponseDto[]) : []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Не удалось выполнить поиск';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string) => {
    const newName = editing[id]?.trim();
    if (!newName) return;
    setUpdatingId(id);
    setError(null);
    try {
      const res = await authorizedFetch(`${API_BASE_URL}/tags/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name: newName } as UpdateTagDto),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTags((prev) => prev.map((t) => (t.id === id ? { ...t, name: newName } : t)));
      tagsService.clearCache();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить тег';
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <input
          className={styles.input}
          type="text"
          placeholder="Поиск тегов (мин. 3 символа)"
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            search(v);
          }}
        />
        <button className="ui-btn" onClick={() => fetchAll(true)} disabled={loading}>
          Обновить
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <EditableTable
        rows={tags as unknown as EditableRow[]}
        editing={editing}
        setEditing={(updater) => setEditing((prev) => updater(prev))}
        updatingId={updatingId}
        onSave={update}
        loading={loading}
        emptyText="Теги не найдены"
        enableCopyId
        onCopyId={handleCopyId}
      />
    </div>
  );
};

export default TagManager;
