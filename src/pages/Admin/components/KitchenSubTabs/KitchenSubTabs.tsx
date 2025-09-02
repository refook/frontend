import React, { useEffect, useState } from 'react';
import styles from './KitchenSubTabs.module.css';
import EditableTable, { type EditableRow } from '../EditableTable/EditableTable';
import KitchensService, { type KitchenResponseDto } from '../../../../services/kitchensService';
import AdminCard from '../AdminCard/AdminCard';
import CreateTagForm from '../CreateTagForm/CreateTagForm';

interface KitchenSubTabsProps { mode: 'create' | 'manage' }

const KitchenSubTabs: React.FC<KitchenSubTabsProps> = ({ mode }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<KitchenResponseDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const load = async () => {
    const list = await KitchensService.getAll();
    setItems(list);
  };

  const search = async (name: string) => {
    if (!name || name.length < 3) {
      await load();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await KitchensService.search(name);
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Не удалось выполнить поиск');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await KitchensService.create(name.trim());
      setName('');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Не удалось создать кухню');
    } finally {
      setLoading(false);
    }
  };

  const [editing, setEditing] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const onUpdate = async (id: string) => {
    const newName = editing[id]?.trim();
    if (!newName) return;
    setUpdatingId(id);
    try {
      await KitchensService.update(id, newName);
      setItems(prev => prev.map(k => (k.id === id ? { ...k, name: newName } : k)));
    } catch (e) {
      console.error('Не удалось обновить кухню');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      {mode === 'create' && (
        <div className={styles.section}>
          <AdminCard
            title="Создать кухню"
            description="Создайте новую кухню. Кухни помогают фильтровать и категоризировать рецепты."
          >
            <CreateTagForm
              apiUrl={`${import.meta.env.DEV ? '/api/v1' : 'https://api.refook.ru/v1'}/kitchens`}
              titleLabel="Название кухни*"
              placeholder="Например: Русская, Итальянская, Японская..."
              submitLabel="Создать кухню"
              successMessage="Кухня успешно создана"
              onCreated={async () => {
                await load();
              }}
            />
          </AdminCard>
        </div>
      )}

      {mode === 'manage' && (
        <div className={styles.section}>
          <AdminCard title="Управление кухнями">
            <div className={styles.createForm} style={{ marginBottom: 12 }}>
              <input
                className="ui-input"
                type="text"
                placeholder="Поиск кухонь (мин. 3 символа)"
                value={query}
                onChange={(e) => {
                  const v = e.target.value;
                  setQuery(v);
                  search(v);
                }}
              />
              <button className="ui-btn" onClick={() => load()} disabled={loading}>Обновить</button>
            </div>
            {items.length === 0 ? (
              <div className={styles.empty}>Список пуст</div>
            ) : (
              <EditableTable
                rows={items as unknown as EditableRow[]}
                editing={editing}
                setEditing={(updater) => setEditing((prev) => updater(prev))}
                updatingId={updatingId}
                onSave={onUpdate}
                loading={loading}
                emptyText="Кухни не найдены"
                enableCopyId
                onCopyId={(id) => {
                  try { navigator.clipboard.writeText(id); } catch {}
                }}
              />
            )}
          </AdminCard>
        </div>
      )}
    </div>
  );
};

export default KitchenSubTabs;


