import React, { useCallback, useEffect } from 'react';
import styles from './KitchenSubTabs.module.css';
import EditableTable, { type EditableRow } from '../EditableTable/EditableTable';
import KitchensService, { type KitchenResponseDto } from '../../../../services/kitchensService';
import AdminCard from '../AdminCard/AdminCard';
import CreateTagForm from '../CreateTagForm/CreateTagForm';
import { useAdminNamedEntities } from '../../hooks/useAdminNamedEntities';
import {API_BASE_URL} from "../../../../services/api.ts";

interface KitchenSubTabsProps { mode: 'create' | 'manage' }

const KitchenSubTabs: React.FC<KitchenSubTabsProps> = ({ mode }) => {
  const getAll = useCallback((options?: { force?: boolean }) => KitchensService.getAll(options), []);
  const searchKitchens = useCallback((value: string) => KitchensService.search(value), []);
  const updateKitchen = useCallback((id: string, name: string) => KitchensService.update(id, name), []);

  const { items, loading, error, query, editing, updatingId, setEditing, refresh, handleQueryChange, save } =
    useAdminNamedEntities<KitchenResponseDto>({
      getAll,
      search: searchKitchens,
      update: updateKitchen,
    });

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className={styles.wrapper}>
      {mode === 'create' && (
        <div className={styles.section}>
          <AdminCard
            title="Создать кухню"
            description="Создайте новую кухню. Кухни помогают фильтровать и категоризировать рецепты."
          >
            <CreateTagForm
              apiUrl={`${API_BASE_URL}}/kitchens`}
              titleLabel="Название кухни*"
              placeholder="Например: Русская, Итальянская, Японская..."
              submitLabel="Создать кухню"
              successMessage="Кухня успешно создана"
              onCreated={async () => {
                await refresh({ force: true });
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
                  void handleQueryChange(e.target.value);
                }}
              />
              <button className="ui-btn" onClick={() => refresh({ force: true })} disabled={loading}>Обновить</button>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            {items.length === 0 ? (
              <div className={styles.empty}>Список пуст</div>
            ) : (
              <EditableTable
                rows={items as unknown as EditableRow[]}
                editing={editing}
                setEditing={(updater) => setEditing((prev) => updater(prev))}
                updatingId={updatingId}
                onSave={(id) => { void save(id); }}
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

