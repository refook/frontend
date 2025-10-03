import { useCallback, useRef } from 'react';
import type { ProductMeasureResponseDto } from '../types/api.types';
import { productsService } from '../services/productsService';

const buildCacheKey = (params: {
  baseProductId?: string;
  variantId?: string;
}) => {
  if (params.variantId) return `variant:${params.variantId}`;
  if (params.baseProductId) return `base:${params.baseProductId}`;
  return undefined;
};

export const useProductMeasureCache = () => {
  const cacheRef = useRef<Map<string, ProductMeasureResponseDto[]>>(new Map());

  const getMeasures = useCallback(
    async ({
      baseProductId,
      variantId,
    }: {
      baseProductId?: string;
      variantId?: string;
    }): Promise<ProductMeasureResponseDto[]> => {
      const cacheKey = buildCacheKey({ baseProductId, variantId });
      if (!cacheKey) return [];

      if (cacheRef.current.has(cacheKey)) {
        return cacheRef.current.get(cacheKey) ?? [];
      }

      try {
        const measures = variantId
          ? await productsService.getVariantMeasures(variantId)
          : await productsService.getBaseMeasures(baseProductId as string);
        cacheRef.current.set(cacheKey, measures);
        return measures ?? [];
      } catch (error) {
        console.error('Не удалось загрузить меры продукта', { baseProductId, variantId, error });
        cacheRef.current.set(cacheKey, []);
        return [];
      }
    },
    [],
  );

  const invalidate = useCallback((key: string) => {
    cacheRef.current.delete(key);
  }, []);

  return {
    getMeasures,
    invalidate,
  };
};
