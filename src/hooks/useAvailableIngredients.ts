import { useEffect, useRef, useState } from 'react';
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

export const useAvailableIngredients = (enabled: boolean): UseAvailableIngredientsResult => {
  const cacheRef = useRef<AvailableIngredient[] | null>(null);
  const inflightRef = useRef<Promise<AvailableIngredient[] | null> | null>(null);
  const [ingredients, setIngredients] = useState<AvailableIngredient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  const load = async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      setError(null);
      if (cacheRef.current) {
        setIngredients(cacheRef.current);
        setLoading(false);
        return;
      }
      if (!inflightRef.current) {
        inflightRef.current = productsService
          .getAllProducts()
          .then((data) => {
            const mapped = (data ?? []).map((product) => ({
              id: product.id,
              name: product.name ?? 'Без названия',
              description: product.description ?? '',
            })) as AvailableIngredient[];
            cacheRef.current = mapped;
            return mapped;
          })
          .finally(() => {
            inflightRef.current = null;
          });
      }
      const result = await inflightRef.current;
      if (result) setIngredients(result);
    } catch (err) {
      setError(err);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setIngredients([]);
      return;
    }
    void load();
  }, [enabled]);

  const refresh = async () => {
    cacheRef.current = null;
    await load();
  };

  return {
    ingredients,
    loading,
    error,
    refresh,
  };
};
