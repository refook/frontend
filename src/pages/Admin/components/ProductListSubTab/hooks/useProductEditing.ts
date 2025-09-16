import { useCallback, useEffect, useMemo, useState } from 'react';
import { productsService } from '../../../../../services';
import type {
  UpdateProductDto,
  ProductMeasureResponseDto,
  UpdateBaseProductMeasureDto,
  AddBaseProductMeasureDto,
} from '../../../../../types/api.types';
import type { EditableRow } from '../../EditableTable/EditableTable';

export function useProductEditing() {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UpdateProductDto | null>(null);
  const [measures, setMeasures] = useState<ProductMeasureResponseDto[]>([]);
  const [baseMeasures, setBaseMeasures] = useState<ProductMeasureResponseDto[]>([]);
  const [measureEditing, setMeasureEditing] = useState<Record<string, UpdateBaseProductMeasureDto>>({});
  const [newMeasure, setNewMeasure] = useState<AddBaseProductMeasureDto>({ name: 'грамм', weight: 100, isDefault: false, density: 1 });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await productsService.getAllProducts();
      const mapped: EditableRow[] = list.map((p) => ({ id: p.id, name: p.name }));
      setRows(mapped);
    } catch (e) {
      setError('Ошибка загрузки продуктов');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const searchByName = useCallback(async (name: string) => {
    if (!name || name.length < 3) {
      await fetchAll();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await productsService.searchProductsByName(name);
      const mapped: EditableRow[] = result.map((p) => ({ id: p.id, name: p.name }));
      setRows(mapped);
    } catch (e) {
      setError('Ошибка при поиске продуктов');
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  const handleSaveRow = useCallback(async (id: string) => {
    setUpdatingId(id);
    try {
      setEditing((prev) => ({ ...prev, [id]: prev[id] ?? '' }));
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const openEdit = useCallback(async (id: string) => {
    setEditingId(id);
    try {
      setUpdatingId(id);
      const p = await productsService.getProductById(id);
      const ms = await productsService.getBaseMeasures(id);
      setForm({
        name: p.name,
        description: (p as any).description ?? '',
        categoryId: (p as any).categoryId ?? null,
        photo: (p as any).photo ?? null,
        macros: p.macros,
      });
      setMeasures(ms);
      setBaseMeasures(ms);
      setMeasureEditing(ms.reduce((acc, m) => {
        acc[m.id] = { id: m.id, name: m.name, weight: m.weight, isDefault: m.isDefault, density: m.density };
        return acc;
      }, {} as Record<string, UpdateBaseProductMeasureDto>));
    } catch (e) {
      setError('Не удалось загрузить продукт');
      setEditingId(null);
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const saveMeasure = useCallback(async (id: string) => {
    if (!editingId) return;
    const m = measures.find((x) => x.id === id);
    if (!m) return;
    const dto = (measureEditing[id] ?? m) as any;
    try {
      setUpdatingId(editingId);
      await productsService.updateBaseMeasure(editingId, dto);
      const refreshed = await productsService.getBaseMeasures(editingId);
      setMeasures(refreshed);
    } catch (e) {
      setError('Не удалось обновить меру');
    } finally {
      setUpdatingId(null);
    }
  }, [editingId, measureEditing, measures]);

  const addBaseMeasure = useCallback(async () => {
    if (!editingId) return;
    try {
      setUpdatingId(editingId);
      await productsService.addBaseMeasure(editingId, newMeasure);
      const refreshed = await productsService.getBaseMeasures(editingId);
      setMeasures(refreshed);
    } catch (e) {
      setError('Не удалось добавить меру');
    } finally {
      setUpdatingId(null);
    }
  }, [editingId, newMeasure]);

  return {
    rows,
    editing,
    setEditing,
    loading,
    updatingId,
    setUpdatingId,
    error,
    setError,
    editingId,
    setEditingId,
    form,
    setForm,
    measures,
    setMeasures,
    baseMeasures,
    setBaseMeasures,
    measureEditing,
    setMeasureEditing,
    newMeasure,
    setNewMeasure,
    fetchAll,
    searchByName,
    handleSaveRow,
    openEdit,
    saveMeasure,
    addBaseMeasure,
  } as const;
}


