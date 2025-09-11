import React, { useEffect, useState } from 'react';
import EditableTable, { type EditableRow } from '../EditableTable/EditableTable';
import { productsService } from '../../../../services';
import type { UpdateProductDto } from '../../../../types/api.types';

const ProductListSubTab: React.FC = () => {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UpdateProductDto | null>(null);

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
      setForm({
        name: p.name,
        description: p.description,
        categoryId: p.categoryId ?? null,
        photo: p.photo ?? null,
        macros: p.macros,
      });
    } catch (e) {
      setError('Не удалось загрузить продукт');
      setEditingId(null);
    } finally {
      setUpdatingId(null);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !form) return;
    try {
      setUpdatingId(editingId);
      await productsService.updateProduct(editingId, form);
      setEditingId(null);
    } catch (e) {
      setError('Не удалось обновить продукт');
    } finally {
      setUpdatingId(null);
    }
  };

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
        <form onSubmit={submitEdit} style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <label>
              Название*
              <input
                className="ui-input"
                type="text"
                value={form.name}
                maxLength={64}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Описание
              <input
                className="ui-input"
                type="text"
                value={form.description ?? ''}
                maxLength={1000}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label>
              Категория (uuid)
              <input
                className="ui-input"
                type="text"
                placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
                value={form.categoryId ?? ''}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value || null })}
              />
            </label>
            <label>
              URL фото
              <input
                className="ui-input"
                type="url"
                placeholder="https://..."
                value={form.photo ?? ''}
                onChange={(e) => setForm({ ...form, photo: e.target.value || null })}
                maxLength={2000}
              />
            </label>
            <label>
              Ккал*
              <input
                className="ui-input"
                type="number"
                min={0}
                max={100000}
                step={1}
                value={form.macros.calories}
                onChange={(e) => setForm({ ...form, macros: { ...form.macros, calories: Number(e.target.value) } })}
                required
              />
            </label>
            <label>
              Белки*
              <input
                className="ui-input"
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={form.macros.proteins}
                onChange={(e) => setForm({ ...form, macros: { ...form.macros, proteins: Number(e.target.value) } })}
                required
              />
            </label>
            <label>
              Жиры*
              <input
                className="ui-input"
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={form.macros.fats}
                onChange={(e) => setForm({ ...form, macros: { ...form.macros, fats: Number(e.target.value) } })}
                required
              />
            </label>
            <label>
              Углеводы*
              <input
                className="ui-input"
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={form.macros.carbs}
                onChange={(e) => setForm({ ...form, macros: { ...form.macros, carbs: Number(e.target.value) } })}
                required
              />
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="ui-btn ui-btn--primary" type="submit" disabled={!!updatingId}>
              {updatingId ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            <button className="ui-btn ui-btn--ghost" type="button" onClick={() => setEditingId(null)} style={{ marginLeft: 8 }}>
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductListSubTab;


