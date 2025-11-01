import React from 'react';
import { ENTITY_REGISTRY, type EntityType } from './entityRegistry';
import NamedEntitySubTabs from '../components/shared/NamedEntitySubTabs/NamedEntitySubTabs';

/**
 * Создает конфигурацию вкладки для именованной сущности с автоматической генерацией подвкладок
 * 
 * @param entityType - Тип сущности из реестра
 * @returns Конфигурация вкладки с подвкладками create и manage
 * 
 * @example
 * const tagTab = createNamedEntityTab('tag');
 * // Возвращает:
 * // {
 * //   id: 'tags',
 * //   label: 'Теги',
 * //   Icon: TagIcon,
 * //   subtabs: [
 * //     { id: 'tags:create', label: 'Создать', ... },
 * //     { id: 'tags:manage', label: 'Управление', ... }
 * //   ]
 * // }
 */
export function createNamedEntityTab(entityType: EntityType) {
  const config = ENTITY_REGISTRY[entityType];
  
  return {
    id: config.id,
    label: config.label,
    Icon: config.icon,
    subtabs: [
      {
        id: `${config.id}:create`,
        label: 'Создать',
        title: config.texts.titleCreate,
        content: <NamedEntitySubTabs mode="create" entityType={entityType} />,
      },
      {
        id: `${config.id}:manage`,
        label: 'Управление',
        title: config.texts.titleManage,
        content: <NamedEntitySubTabs mode="manage" entityType={entityType} />,
      },
    ],
  };
}

/**
 * Экспорт реестра для использования в других компонентах
 */
export { ENTITY_REGISTRY };

