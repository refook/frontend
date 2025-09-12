import React, { useEffect, useState } from 'react';
import EditableTable, { type EditableRow } from '../EditableTable/EditableTable';
import { productsService } from '../../../../services';
import type { UpdateProductDto, ProductMeasureResponseDto, UpdateBaseProductMeasureDto, AddBaseProductMeasureDto, ChangeProductVariantDto } from '../../../../types/api.types';
import ProductForm from '../ProductForm/ProductForm';
import { PRODUCT_UNITS_ARRAY } from '../../../../constants/measures';

const ProductListSubTab: React.FC = () => {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UpdateProductDto | null>(null);
  const [measures, setMeasures] = useState<ProductMeasureResponseDto[]>([]);
  const [measureEditing, setMeasureEditing] = useState<Record<string, UpdateBaseProductMeasureDto>>({});
  const [newMeasure, setNewMeasure] = useState<AddBaseProductMeasureDto>({ name: PRODUCT_UNITS_ARRAY[0].label, weight: 100, isDefault: false, density: 1 });
  const [variant, setVariant] = useState<ChangeProductVariantDto>({
    name: '',
    brandId: null,
    description: '',
    categoryId: null,
    photo: null,
    macros: { calories: 0, proteins: 0, fats: 0, carbs: 0, isEmpty: false },
  });
  const [createMode, setCreateMode] = useState<'base' | 'variant'>('variant');
  const baseFormValue = form ?? { name: '', description: '', categoryId: null, photo: null, macros: { calories: 0, proteins: 0, fats: 0, carbs: 0, isEmpty: false } };

  const fetchAll = async () => {
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
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [search, setSearch] = useState<string>('');
  const searchByName = async (name: string) => {
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
  };

  const handleSave = async (id: string) => {
    // Пока бэкенд-метода редактирования нет — просто снимаем "редактирование"
    setUpdatingId(id);
    try {
      setEditing((prev) => ({ ...prev, [id]: prev[id] ?? '' }));
    } finally {
      setUpdatingId(null);
    }
  };

  const openEdit = async (id: string) => {
    setEditingId(id);
    try {
      setUpdatingId(id);
      const p = await productsService.getProductById(id);
      const ms = await productsService.getBaseMeasures(id);
      setForm({
        name: p.name,
        description: p.description,
        categoryId: p.categoryId ?? null,
        photo: p.photo ?? null,
        macros: p.macros,
      });
      setMeasures(ms);
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
  };

  // Базовые поля редактируются через универсальную ProductForm ниже

  return (
    <div>
      {error && <div style={{ marginBottom: 12, color: 'var(--ui-error, #b91c1c)' }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          className="ui-input"
          type="text"
          placeholder="Поиск продуктов (мин. 3 символа)"
          value={search}
          onChange={(e) => {
            const v = e.target.value;
            setSearch(v);
            void searchByName(v.trim());
          }}
        />
        <button className="ui-btn" type="button" onClick={() => fetchAll()} disabled={loading}>
          Обновить
        </button>
      </div>
      <EditableTable
        rows={rows}
        editing={editing}
        setEditing={setEditing}
        updatingId={updatingId}
        onSave={handleSave}
        loading={loading}
        emptyText="Продукты не найдены"
        enableCopyId
        onCopyId={(id: string) => navigator.clipboard.writeText(id)}
        onEditClick={openEdit}
      />
      {editingId && form && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginTop: 12 }}>
            <button className="ui-btn ui-btn--primary" type="submit" disabled={!!updatingId}>
              {updatingId ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            <button className="ui-btn ui-btn--ghost" type="button" onClick={() => setEditingId(null)} style={{ marginLeft: 8 }}>
              Отмена
            </button>
          </div>
          {/* Таблица мер продукта */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <h4 style={{ margin: 0 }}>Базовые меры</h4>
              <button
                type="button"
                className="ui-btn"
                onClick={() => editingId && productsService.getBaseMeasures(editingId).then(setMeasures)}
                disabled={!!updatingId}
              >
                Обновить меры
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8 }}>
              <div><strong>Название</strong></div>
              <div><strong>Вес (г)</strong></div>
              <div><strong>Плотность</strong></div>
              <div><strong>Основная</strong></div>
              <div />
              {measures.map((m) => (
                <React.Fragment key={m.id}>
                  <select
                    className="ui-input"
                    value={measureEditing[m.id]?.name ?? m.name}
                    onChange={(e) => setMeasureEditing((prev) => ({
                      ...prev,
                      [m.id]: { ...(prev[m.id] ?? { id: m.id, name: m.name, weight: m.weight, isDefault: m.isDefault, density: m.density }), name: e.target.value },
                    }))}
                  >
                    {PRODUCT_UNITS_ARRAY.map((u) => (
                      <option key={u.value} value={u.label}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className="ui-input"
                    type="number"
                    min={1}
                    step={1}
                    value={measureEditing[m.id]?.weight ?? m.weight}
                    onChange={(e) => setMeasureEditing((prev) => ({
                      ...prev,
                      [m.id]: { ...(prev[m.id] ?? { id: m.id, name: m.name, weight: m.weight, isDefault: m.isDefault, density: m.density }), weight: Number(e.target.value) },
                    }))}
                  />
                  <input
                    className="ui-input"
                    type="number"
                    min={0}
                    step={0.01}
                    value={measureEditing[m.id]?.density ?? m.density ?? 1}
                    onChange={(e) => setMeasureEditing((prev) => ({
                      ...prev,
                      [m.id]: { ...(prev[m.id] ?? { id: m.id, name: m.name, weight: m.weight, isDefault: m.isDefault, density: m.density }), density: Number(e.target.value) },
                    }))}
                  />
                  <input
                    type="checkbox"
                    checked={measureEditing[m.id]?.isDefault ?? m.isDefault}
                    onChange={(e) => setMeasureEditing((prev) => {
                      // Ровно одна основная: сбрасываем остальные
                      const next = Object.fromEntries(Object.entries(prev).map(([id, val]) => [id, { ...val, isDefault: false }]));
                      const current = next[m.id] ?? { id: m.id, name: m.name, weight: m.weight, isDefault: m.isDefault, density: m.density };
                      next[m.id] = { ...current, isDefault: e.target.checked };
                      return next;
                    })}
                  />
                  <div>
                    <button
                      type="button"
                      className="ui-btn ui-btn--primary"
                      onClick={async () => {
                        if (!editingId) return;
                        const dto = measureEditing[m.id] ?? { id: m.id, name: m.name, weight: m.weight, isDefault: m.isDefault, density: m.density };
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
                      }}
                    >
                      Сохранить меру
                    </button>
                  </div>
                </React.Fragment>
              ))}
            </div>
            {/* Форма добавления новой меры */}
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8 }}>
              <select
                className="ui-input"
                value={newMeasure.name}
                onChange={(e) => setNewMeasure({ ...newMeasure, name: e.target.value })}
              >
                {PRODUCT_UNITS_ARRAY.map((u) => (
                  <option key={u.value} value={u.label}>{u.label}</option>
                ))}
              </select>
              <input
                className="ui-input"
                type="number"
                min={1}
                step={1}
                value={newMeasure.weight}
                onChange={(e) => setNewMeasure({ ...newMeasure, weight: Number(e.target.value) })}
              />
              <input
                className="ui-input"
                type="number"
                min={0}
                step={0.01}
                value={newMeasure.density ?? 1}
                onChange={(e) => setNewMeasure({ ...newMeasure, density: Number(e.target.value) })}
              />
              <input
                type="checkbox"
                checked={newMeasure.isDefault}
                onChange={(e) => setNewMeasure({ ...newMeasure, isDefault: e.target.checked })}
              />
              <div>
                <button
                  type="button"
                  className="ui-btn ui-btn--primary"
                  onClick={async () => {
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
                  }}
                >
                  Добавить меру
                </button>
              </div>
            </div>
            {/* Форма варианта продукта */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  Режим сохранения:
                  <select
                    className="ui-input"
                    value={createMode}
                    onChange={(e) => setCreateMode(e.target.value as 'base' | 'variant')}
                  >
                    <option value="variant">Создать вариант продукта</option>
                    <option value="base">Обновить базовый продукт</option>
                  </select>
                </label>
              </div>
              <ProductForm
                mode={createMode}
                value={createMode === 'variant' ? variant : (baseFormValue as unknown as ChangeProductVariantDto)}
                onChange={(next) => {
                  if (createMode === 'variant') {
                    setVariant({ ...variant, ...next });
                  } else if (form) {
                    setForm({
                      ...form,
                      name: next.name,
                      description: next.description,
                      categoryId: next.categoryId,
                      photo: next.photo,
                      macros: next.macros,
                    });
                  } else {
                    // если формы еще нет (редактирование только открыто), создаём базовое значение
                    setForm({
                      name: next.name,
                      description: next.description ?? '',
                      categoryId: next.categoryId ?? null,
                      photo: next.photo ?? null,
                      macros: next.macros,
                    });
                  }
                }}
              />
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="ui-btn ui-btn--primary"
                  disabled={!editingId || !!updatingId}
                  onClick={async () => {
                    if (!editingId) return;
                    try {
                      setUpdatingId(editingId);
                      if (createMode === 'variant') {
                        await productsService.saveProductVariant(editingId, variant);
                      } else if (form) {
                        await productsService.updateProduct(editingId, form);
                      }
                    } catch (e) {
                      setError('Не удалось сохранить данные');
                    } finally {
                      setUpdatingId(null);
                    }
                  }}
                >
                  {createMode === 'variant' ? 'Сохранить вариант' : 'Сохранить базовый продукт'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListSubTab;


