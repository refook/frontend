import React, { useCallback, useEffect, useState } from 'react';
import styles from './NamedEntityManager.module.css';
import EditableTable, { type EditableRow } from '../../EditableTable/EditableTable';
import SearchBar from '../../SearchBar/SearchBar';
import EditBadgeModal from '../EditBadgeModal/EditBadgeModal';
import { useAdminNamedEntities } from '../../../hooks/useAdminNamedEntities';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { ENTITY_REGISTRY, type EntityType } from '../../../config/entityRegistry';
import type { TagResponseDto } from '../../../../../types/recipe.types';
import type { CategoryResponseDto } from '../../../../../types/category.types';
import type { KitchenResponseDto } from '../../../../../services/kitchensService';
import type { BadgeEntityAdapter } from '../../../../../services/badgesService';
import type { BadgeResponseDto } from '../../../../../types/recipe.types';

/**
 * Свойства компонента менеджера именованных сущностей.
 *
 * @interface NamedEntityManagerProps
 * @property {EntityType} entityType - Тип сущности: 'tag', 'category', 'kitchen' или 'badge'.
 *   Определяет конфигурацию из `ENTITY_REGISTRY` и используемые сервисы.
 */
interface NamedEntityManagerProps {
  entityType: EntityType;
}

/**
 * Компонент для управления списком именованных сущностей в админ-панели.
 *
 * @component
 * @description
 * Универсальный компонент для отображения списка сущностей с возможностью поиска, редактирования,
 * копирования ID и удаления. Поддерживает работу с тегами, категориями, кухнями и бейджами.
 *
 * @features
 * - Поиск по названию сущности с задержкой (debounce)
 * - Редактирование названия сущности прямо в таблице (для простых сущностей)
 * - Специальная форма редактирования для бейджей (модальное окно)
 * - Копирование ID сущности в буфер обмена
 * - Обновление списка с принудительным обновлением кэша
 * - Отображение состояния загрузки и ошибок
 * - Автоматическая загрузка данных при монтировании компонента
 *
 * @entitySpecificBehavior
 * - **Теги, категории, кухни**: Редактирование названия происходит прямо в таблице через `EditableTable`
 * - **Бейджи**: Редактирование происходит через модальное окно `EditBadgeModal` (из-за сложной структуры)
 * - Для бейджей кнопка сохранения в таблице отключена (`enableSave={false}`)
 * - Для бейджей используется специальный обработчик клика на редактирование (`onEditClick`)
 *
 * @example
 * ```tsx
 * // Управление тегами
 * <NamedEntityManager entityType="tag" />
 *
 * // Управление бейджами
 * <NamedEntityManager entityType="badge" />
 * ```
 *
 * @remarks
 * - Компонент использует хук `useAdminNamedEntities` для управления состоянием и данными
 * - Сервисы получаются из `ENTITY_REGISTRY` на основе `entityType`
 * - Для бейджей используется адаптер `BadgeEntityAdapter`, который преобразует `title` в `name`
 * - При редактировании бейджа открывается модальное окно с полной формой редактирования
 * - После успешного обновления бейджа список автоматически обновляется с принудительным обновлением кэша
 * - Ошибки при обновлении списка логируются в консоль, но не блокируют работу интерфейса
 */
const NamedEntityManager: React.FC<NamedEntityManagerProps> = ({ entityType }) => {
  const config = ENTITY_REGISTRY[entityType];
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);
  const [editingBadge, setEditingBadge] = useState<BadgeResponseDto | null>(null);
  
  const getAll = useCallback(
    (options?: { force?: boolean }) => config.service.getAll(options),
    [config.service]
  );
  
  const search = useCallback(
    (name: string) => config.service.search(name),
    [config.service]
  );
  
  const update = useCallback(
    (id: string, name: string) => config.service.update(id, name),
    [config.service]
  );

  const { items, loading, error, query, editing, updatingId, setEditing, refresh, handleQueryChange, save } =
    useAdminNamedEntities<TagResponseDto | CategoryResponseDto | KitchenResponseDto | BadgeEntityAdapter>({
      getAll,
      search,
      update,
    });

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const copyToClipboard = useCopyToClipboard();

  // Обработчик клика на редактирование для бейджей
  const handleEditBadge = useCallback((id: string) => {
    if (entityType === 'badge') {
      const badgeAdapter = items.find((item) => item.id === id) as BadgeEntityAdapter | undefined;
      if (badgeAdapter?.original) {
        setEditingBadge(badgeAdapter.original);
        setEditingBadgeId(id);
      }
    }
  }, [entityType, items]);

  // Обработчик закрытия модального окна
  const handleCloseModal = useCallback(() => {
    setEditingBadgeId(null);
    setEditingBadge(null);
  }, []);

  // Обработчик обновления бейджа
  const handleBadgeUpdated = useCallback(async () => {
    // Обновляем данные в фоне, не блокируя закрытие модального окна
    await refresh({ force: true }).catch((err) => {
      console.error('Ошибка при обновлении списка бейджей:', err);
    });
  }, [refresh]);

  return (
    <div className={styles.wrapper}>
      <SearchBar
        value={query}
        placeholder={config.texts.searchPlaceholder}
        loading={loading}
        onChange={(value) => {
          void handleQueryChange(value);
        }}
        onRefresh={() => refresh({ force: true })}
      />

      {error && <div className={styles.error}>{error}</div>}

      <EditableTable
        rows={items as unknown as EditableRow[]}
        editing={editing}
        setEditing={(updater) => setEditing((prev) => updater(prev))}
        updatingId={updatingId}
        onSave={(id) => { void save(id); }}
        loading={loading}
        emptyText={config.texts.emptyText}
        enableCopyId
        onCopyId={(id) => { void copyToClipboard(id); }}
        onEditClick={entityType === 'badge' ? handleEditBadge : undefined}
        enableSave={entityType !== 'badge'}
      />

      {/* Модальное окно для редактирования бейджей */}
      {entityType === 'badge' && editingBadge && (
        <EditBadgeModal
          badge={editingBadge}
          isOpen={editingBadgeId !== null}
          onClose={handleCloseModal}
          onUpdated={handleBadgeUpdated}
        />
      )}
    </div>
  );
};

export default NamedEntityManager;
