import { useEffect, useMemo, useRef, useState } from 'react';
import { productsService } from '../services/productsService';
import { resolveIngredientIdentifiers } from '../utils/recipeIngredient';

const collectVariantIds = (items: unknown[]): string[] => {
  const ids = new Set<string>();
  items.forEach((item) => {
    const meta = resolveIngredientIdentifiers(item);
    if (meta.variantId) {
      ids.add(meta.variantId);
    }
  });
  return Array.from(ids);
};

export const useVariantNames = (items: unknown[]): Record<string, string> => {
  const targets = useMemo(() => collectVariantIds(items), [items]);
  const [variantNames, setVariantNames] = useState<Record<string, string>>({});
  const loadingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const missing = targets.filter((id) => Boolean(id) && !variantNames[id] && !loadingRef.current.has(id));
    if (missing.length === 0) return;

    let cancelled = false;
    missing.forEach((id) => loadingRef.current.add(id));

    (async () => {
      const updates: Record<string, string> = {};
      for (const id of missing) {
        try {
          const variant = await productsService.getProductVariantById(id);
          if (variant?.name) {
            updates[id] = variant.name;
          }
        } catch {
          // ignore fetch errors for individual variants
        }
      }
      if (!cancelled && Object.keys(updates).length > 0) {
        setVariantNames((prev) => ({ ...prev, ...updates }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [targets, variantNames]);

  return variantNames;
};
