import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

export interface NamedEntityLike {
  id: string;
  name: string;
}

export interface UseAdminNamedEntitiesOptions<T extends NamedEntityLike> {
  getAll: (options?: { force?: boolean }) => Promise<T[]>;
  search?: (query: string) => Promise<T[]>;
  update?: (id: string, name: string) => Promise<T> | Promise<unknown>;
  minSearchLength?: number;
}

export interface UseAdminNamedEntitiesResult<T extends NamedEntityLike> {
  items: T[];
  loading: boolean;
  error: string | null;
  query: string;
  editing: Record<string, string>;
  updatingId: string | null;
  setEditing: Dispatch<SetStateAction<Record<string, string>>>;
  refresh: (options?: { force?: boolean }) => Promise<void>;
  handleQueryChange: (value: string) => Promise<void>;
  save: (id: string) => Promise<void>;
}

const getErrorMessage = (error: unknown): string => {
  if (!error) return 'Не удалось выполнить операцию';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Неизвестная ошибка';
  }
};

const pruneEditing = <T extends NamedEntityLike>(editing: Record<string, string>, items: T[]): Record<string, string> => {
  const allowedIds = new Set(items.map((item) => item.id));
  const next: Record<string, string> = {};
  for (const [id, value] of Object.entries(editing)) {
    if (allowedIds.has(id)) {
      next[id] = value;
    }
  }
  return next;
};

export const useAdminNamedEntities = <T extends NamedEntityLike>(
  options: UseAdminNamedEntitiesOptions<T>,
): UseAdminNamedEntitiesResult<T> => {
  const { getAll, search, update, minSearchLength = 3 } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const runWithLoading = useCallback(async <R,>(fn: () => Promise<R>): Promise<R> => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(
    async (options?: { force?: boolean }) => {
      try {
        await runWithLoading(async () => {
          const data = await getAll(options);
          setItems(data);
          setEditing((prev) => pruneEditing(prev, data));
        });
      } catch {
        // Ошибка уже сохранена в состоянии
      }
    },
    [getAll, runWithLoading],
  );

  const performSearch = useCallback(
    async (value: string) => {
      if (!search) {
        await refresh();
        return;
      }

      const trimmed = value.trim();
      if (trimmed.length < minSearchLength) {
        await refresh();
        return;
      }

      try {
        await runWithLoading(async () => {
          const result = await search(trimmed);
          setItems(result);
          setEditing((prev) => pruneEditing(prev, result));
        });
      } catch {
        // Ошибка уже обработана runWithLoading
      }
    },
    [minSearchLength, refresh, runWithLoading, search],
  );

  const handleQueryChange = useCallback(
    async (value: string) => {
      setQuery(value);
      await performSearch(value);
    },
    [performSearch],
  );

  const save = useCallback(
    async (id: string) => {
      if (!update) return;
      const draft = editing[id] ?? '';
      const newName = draft.trim();
      if (!newName) return;

      const current = items.find((item) => item.id === id);
      if (current && current.name === newName) return;

      setUpdatingId(id);
      setError(null);
      try {
        await update(id, newName);
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, name: newName } : item)));
        setEditing((prev) => ({ ...prev, [id]: newName }));
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
      } finally {
        setUpdatingId(null);
      }
    },
    [editing, items, update],
  );

  return useMemo(() => ({
    items,
    loading,
    error,
    query,
    editing,
    updatingId,
    setEditing,
    refresh,
    handleQueryChange,
    save,
  }), [editing, error, handleQueryChange, items, loading, query, refresh, save, updatingId]);
};

export default useAdminNamedEntities;
