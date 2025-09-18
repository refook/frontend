import { useCallback, useEffect, useMemo, useState } from 'react';
import { productsService } from '../../../../../services';
import type {
  ChangeProductVariantDto,
  ProductMeasureResponseDto,
  UpdateBaseProductMeasureDto,
  AddProductVariantMeasureDto,
} from '../../../../../types/api.types';
import { PRODUCT_UNITS_ARRAY } from '../../../../../constants/measures';

export type VariantMode = 'base' | 'variant' | 'variant_update';

export function useVariantEditing() {
  const [variant, setVariant] = useState<ChangeProductVariantDto>({
    name: '',
    brandId: null,
    description: '',
    categoryId: null,
    photo: null,
    macros: { calories: 0, proteins: 0, fats: 0, carbs: 0, isEmpty: false },
  });
  const [createMode, setCreateMode] = useState<VariantMode>('variant');
  const [allVariants, setAllVariants] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [measures, setMeasures] = useState<ProductMeasureResponseDto[]>([]);
  const [measureEditing, setMeasureEditing] = useState<Record<string, UpdateBaseProductMeasureDto>>({});
  const [newVariantMeasure, setNewVariantMeasure] = useState<AddProductVariantMeasureDto>({ baseMeasureId: '', weight: 100, density: 1 });
  const [newVariantUnitName, setNewVariantUnitName] = useState<string>(PRODUCT_UNITS_ARRAY[0].label);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Подсказки по доступным мерам вычисляются снаружи (в компоненте),
  // т.к. базовые меры принадлежат другому хуку

  // Загрузка вариантов конкретного базового продукта
  const loadVariantsByProduct = useCallback(async (productId: string) => {
    if (!productId) return;
    try {
      const vs = await productsService.getProductVariantsByProduct(productId);
      const mapped = vs.map(v => ({ id: v.id, name: v.name }));
      setAllVariants(mapped);
      setSelectedVariantId(mapped[0]?.id ?? '');
    } catch {
      setAllVariants([]);
      setSelectedVariantId('');
    }
  }, []);

  // Корректировка выбранной меры выполняется в компоненте

  const loadVariant = useCallback(async (id: string) => {
    if (!id) return;
    try {
      setUpdatingId(id);
      const v = await productsService.getProductVariantById(id);
      setVariant((prev) => ({
        ...prev,
        name: v.name,
        description: (v as any).description ?? '',
        categoryId: (v as any).categoryId ?? null,
        photo: (v as any).photo ?? null,
        macros: v.macros ?? prev.macros,
      }));
      const ms = await productsService.getVariantMeasures(id, true);
      setMeasures(ms);
      setMeasureEditing(ms.reduce((acc, m) => {
        acc[m.id] = { id: m.id, name: m.name, weight: m.weight, isDefault: m.isDefault, density: m.density };
        return acc;
      }, {} as Record<string, UpdateBaseProductMeasureDto>));
    } catch (e) {
      setError('Не удалось загрузить вариант продукта');
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const addVariantMeasure = useCallback(async () => {
    if (!selectedVariantId || !newVariantMeasure.baseMeasureId) return;
    try {
      setUpdatingId(selectedVariantId);
      await productsService.addVariantMeasure(selectedVariantId, newVariantMeasure);
      const refreshed = await productsService.getVariantMeasures(selectedVariantId, true);
      setMeasures(refreshed);
    } catch (e) {
      setError('Не удалось добавить меру для варианта');
    } finally {
      setUpdatingId(null);
    }
  }, [selectedVariantId, newVariantMeasure]);

  return {
    variant,
    setVariant,
    createMode,
    setCreateMode,
    allVariants,
    selectedVariantId,
    setSelectedVariantId,
    measures,
    setMeasures,
    measureEditing,
    setMeasureEditing,
    newVariantMeasure,
    setNewVariantMeasure,
    newVariantUnitName,
    setNewVariantUnitName,
    // options вычисляются снаружи
    updatingId,
    error,
    setError,
    loadVariant,
    loadVariantsByProduct,
    addVariantMeasure,
  } as const;
}


