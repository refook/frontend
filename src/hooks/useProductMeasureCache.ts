import { useCallback } from 'react';
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

const sharedCache = new Map<string, ProductMeasureResponseDto[]>();
const sharedInflight = new Map<string, Promise<ProductMeasureResponseDto[]>>();

const mapMeasures = (payload: unknown): ProductMeasureResponseDto[] => {
  if (!Array.isArray(payload)) return [];
  return payload.filter((entry): entry is ProductMeasureResponseDto => typeof entry === 'object' && entry !== null);
};

export const useProductMeasureCache = () => {
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

      if (sharedCache.has(cacheKey)) {
        return sharedCache.get(cacheKey) ?? [];
      }

      if (!sharedInflight.has(cacheKey)) {
        const request = (async () => {
          try {
            const raw = variantId
              ? await productsService.getVariantMeasures(variantId)
              : await productsService.getBaseMeasures(baseProductId as string);
            const normalized = mapMeasures(raw ?? []);
            sharedCache.set(cacheKey, normalized);
            return normalized;
          } catch (error) {
            console.error('Не удалось загрузить меры продукта', { baseProductId, variantId, error });
            sharedCache.set(cacheKey, []);
            return [];
          } finally {
            sharedInflight.delete(cacheKey);
          }
        })();
        sharedInflight.set(cacheKey, request);
      }

      try {
        return await (sharedInflight.get(cacheKey) as Promise<ProductMeasureResponseDto[]>);
      } catch (error) {
        console.error('Не удалось загрузить меры продукта', { baseProductId, variantId, error });
        sharedCache.set(cacheKey, []);
        return [];
      }
    },
    [],
  );

  const invalidate = useCallback((key: string) => {
    sharedCache.delete(key);
    sharedInflight.delete(key);
  }, []);

  return {
    getMeasures,
    invalidate,
  };
};
