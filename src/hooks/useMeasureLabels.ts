import { useEffect, useMemo, useState } from 'react';
import type { ProductMeasureResponseDto } from '../types/api.types';
import { useProductMeasureCache } from './useProductMeasureCache';
import { resolveIngredientIdentifiers } from '../utils/recipeIngredient';

interface MeasureRequest {
  measureId: string;
  baseProductId?: string;
  variantId?: string;
}

export const useMeasureLabels = (ingredients: unknown[]): Record<string, string> => {
  const { getMeasures } = useProductMeasureCache();
  const [labels, setLabels] = useState<Record<string, string>>({});

  const pendingRequests = useMemo(() => {
    const requests = new Map<string, MeasureRequest>();

    ingredients.forEach((item) => {
      const measureId = (item as any)?.productMeasureId as string | undefined;
      if (!measureId || requests.has(measureId) || labels[measureId]) return;
      const meta = resolveIngredientIdentifiers(item);
      requests.set(measureId, {
        measureId,
        baseProductId: meta.baseProductId,
        variantId: meta.variantId,
      });
    });

    return Array.from(requests.values());
  }, [ingredients, labels]);

  useEffect(() => {
    if (pendingRequests.length === 0) return;
    let cancelled = false;

    (async () => {
      const updates: Record<string, string> = {};
      for (const request of pendingRequests) {
        const measures = await getMeasures({
          baseProductId: request.baseProductId,
          variantId: request.variantId,
        });
        const match = measures?.find((measure: ProductMeasureResponseDto) => measure.id === request.measureId);
        if (match?.name) {
          updates[request.measureId] = match.name;
        }
      }
      if (!cancelled && Object.keys(updates).length > 0) {
        setLabels((prev) => ({ ...prev, ...updates }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getMeasures, pendingRequests]);

  return labels;
};
