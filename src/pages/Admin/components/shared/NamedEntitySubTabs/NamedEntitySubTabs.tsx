import React from 'react';
import styles from './NamedEntitySubTabs.module.css';
import AdminCard from '../../AdminCard/AdminCard';
import CreateEntityForm from '../CreateEntityForm/CreateEntityForm';
import CreateBadgeForm from '../CreateBadgeForm/CreateBadgeForm';
import NamedEntityManager from '../NamedEntityManager/NamedEntityManager';
import { API_BASE_URL } from '../../../../../services/api';
import { ENTITY_REGISTRY, type EntityType } from '../../../config/entityRegistry';

/**
 * Свойства компонента подвкладок для именованных сущностей.
 *
 * @interface NamedEntitySubTabsProps
 * @property {'create' | 'manage'} mode - Режим отображения: 'create' для формы создания, 'manage' для управления списком.
 * @property {EntityType} entityType - Тип сущности: 'tag', 'category', 'kitchen' или 'badge'.
 *   Определяет конфигурацию из `ENTITY_REGISTRY` и используемый компонент формы.
 */
interface NamedEntitySubTabsProps {
  mode: 'create' | 'manage';
  entityType: EntityType;
}

/**
 * Компонент подвкладок для работы с именованными сущностями в админ-панели.
 *
 * @component
 * @description
 * Универсальный компонент для отображения интерфейса создания или управления именованными сущностями.
 * Автоматически выбирает подходящий компонент формы на основе типа сущности из `ENTITY_REGISTRY`.
 *
 * @features
 * - Поддержка двух режимов: создание и управление
 * - Автоматический выбор формы на основе типа сущности
 * - Для бейджей используется специальная форма `CreateBadgeForm` с полной структурой
 * - Для остальных сущностей (теги, категории, кухни) используется универсальная `CreateEntityForm`
 * - Использование конфигурации из `ENTITY_REGISTRY` для текстов и API путей
 * - Автоматическая очистка кэша сервиса после создания сущности
 *
 * @modes
 * - **create**: Отображает форму создания новой сущности с заголовком и описанием из конфигурации
 * - **manage**: Отображает компонент управления списком сущностей (`NamedEntityManager`)
 *
 * @entityTypes
 * - **tag**: Использует `CreateEntityForm` для создания тегов
 * - **category**: Использует `CreateEntityForm` для создания категорий
 * - **kitchen**: Использует `CreateEntityForm` для создания кухонь
 * - **badge**: Использует `CreateBadgeForm` для создания бейджей (специальная форма с условиями)
 *
 * @example
 * ```tsx
 * // Форма создания тега
 * <NamedEntitySubTabs mode="create" entityType="tag" />
 *
 * // Управление категориями
 * <NamedEntitySubTabs mode="manage" entityType="category" />
 *
 * // Форма создания бейджа
 * <NamedEntitySubTabs mode="create" entityType="badge" />
 * ```
 *
 * @remarks
 * - Компонент использует `ENTITY_REGISTRY` для получения конфигурации сущности
 * - После успешного создания сущности вызывается `service.clearCache()` (если доступен)
 * - Все тексты (заголовки, описания, плейсхолдеры) берутся из конфигурации сущности
 * - Для бейджей используется специальная форма из-за сложной структуры (условия получения)
 */
const NamedEntitySubTabs: React.FC<NamedEntitySubTabsProps> = ({ mode, entityType }) => {
  const config = ENTITY_REGISTRY[entityType];

  if (mode === 'manage') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <AdminCard title={config.texts.titleManage}>
            <NamedEntityManager entityType={entityType} />
          </AdminCard>
        </div>
      </div>
    );
  }

  // Для бейджей используем специальную форму с полной структурой
  if (entityType === 'badge') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <AdminCard
            title={config.texts.titleCreate}
            description={config.texts.description}
          >
            <CreateBadgeForm
              onCreated={() => {
                config.service.clearCache?.();
              }}
            />
          </AdminCard>
        </div>
      </div>
    );
  }

  // Для остальных сущностей используем обычную форму
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <AdminCard
          title={config.texts.titleCreate}
          description={config.texts.description}
        >
          <CreateEntityForm
            apiUrl={`${API_BASE_URL}${config.apiPath}`}
            titleLabel={config.texts.titleLabel}
            placeholder={config.texts.placeholder}
            submitLabel={config.texts.submitLabel}
            successMessage={config.texts.successMessage}
            onCreated={() => {
              // Вызываем clearCache если он доступен для этой сущности
              config.service.clearCache?.();
            }}
          />
        </AdminCard>
      </div>
    </div>
  );
};

export default NamedEntitySubTabs;
