import { useCallback, useEffect, useRef, useState } from 'react';
import { productsService } from '../services/productsService';

export type AvailableIngredient = {
  id: string;
  name: string;
  description?: string;
};

interface UseAvailableIngredientsResult {
  ingredients: AvailableIngredient[];
  loading: boolean;
  error: unknown;
  refresh: () => Promise<void>;
}

let sharedCache: AvailableIngredient[] | null = null;
let sharedInflight: Promise<AvailableIngredient[]> | null = null;

const toNonEmptyString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return null;
};

const mapProducts = (data: unknown): AvailableIngredient[] => {
  if (!Array.isArray(data)) return [];

  const result: AvailableIngredient[] = [];
  data.forEach((item) => {
    if (typeof item !== 'object' || item === null) return;
    const record = item as Record<string, unknown>;
    const id = toNonEmptyString(record.id ?? record.productId ?? record.uuid ?? record.value);
    if (!id) return;
    const name = toNonEmptyString(record.name) ?? 'Без названия';
    const description = typeof record.description === 'string' ? record.description : '';
    result.push({ id, name, description });
  });

  return result;
};

const fetchProducts = async (): Promise<AvailableIngredient[]> => {
  const response = await productsService.getAllProducts();
  const mapped = mapProducts(response ?? []);
  sharedCache = mapped;
  return mapped;
};

export const useAvailableIngredients = (enabled: boolean): UseAvailableIngredientsResult => {
  const isMountedRef = useRef(true);
  const [ingredients, setIngredients] = useState<AvailableIngredient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!enabled || !isMountedRef.current) return;
    setLoading(true);
    setError(null);

    if (sharedCache) {
      setIngredients(sharedCache);
      setLoading(false);
      return;
    }

    if (!sharedInflight) {
      sharedInflight = fetchProducts()
        .catch((err) => {
          sharedCache = null;
          throw err;
        })
        .finally(() => {
          sharedInflight = null;
        });
    }

    const inflight = sharedInflight;
    if (!inflight) {
      setLoading(false);
      return;
    }

    try {
      const result = await inflight;
      if (isMountedRef.current && result) {
        setIngredients(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        setIngredients([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setIngredients([]);
      return;
    }
    void load();
  }, [enabled, load]);

  const refresh = async () => {
    sharedCache = null;
    await load();
  };

  return {
    ingredients,
    loading,
    error,
    refresh,
  };
};
