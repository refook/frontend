import { useEffect, useMemo, useRef, useState } from 'react';
import { productsService } from '../services/productsService';
import { resolveIngredientIdentifiers } from '../utils/recipeIngredient';

const extractVariantName = (variant: unknown): string | undefined => {
  if (!variant || typeof variant !== 'object') return undefined;
  const record = variant as Record<string, unknown>;
  const maybeName =
    record.name ??
    record.variantName ??
    record.displayName ??
    record.title ??
    record.label ??
    (typeof record.product === 'object' && record.product !== null
      ? (record.product as Record<string, unknown>).name
      : undefined) ??
    record.productName;

  if (typeof maybeName === 'string' && maybeName.trim().length > 0) {
    return maybeName.trim();
  }

  return undefined;
};

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
    const missing = targets.filter(
      (id) => Boolean(id) && !variantNames[id] && !loadingRef.current.has(id),
    );
    if (missing.length === 0) return;

    let cancelled = false;
    missing.forEach((id) => loadingRef.current.add(id));

    (async () => {
      const updates: Record<string, string> = {};
      for (const id of missing) {
        try {
          const variant = await productsService.getProductVariantById(id);
          const name = extractVariantName(variant);
          if (name) {
            updates[id] = name;
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
