import React from 'react';
import { TagIcon, FolderIcon, Squares2X2Icon, TrophyIcon } from '@heroicons/react/24/outline';
import { tagsService } from '../../../services/tagsService';
import { CategoriesService } from '../../../services/categoriesService';
import KitchensService from '../../../services/kitchensService';
import BadgesService from '../../../services/badgesService';
import type { TagResponseDto } from '../../../types/recipe.types';
import type { CategoryResponseDto } from '../../../types/category.types';
import type { KitchenResponseDto } from '../../../services/kitchensService';
import type { BadgeEntityAdapter } from '../../../services/badgesService';

/**
 * Интерфейс для сервисов сущностей
 */
export interface EntityService<T = any> {
  getAll: (options?: { force?: boolean }) => Promise<T[]>;
  search: (name: string) => Promise<T[]>;
  update: (id: string, name: string) => Promise<T>;
  clearCache?: () => void;
}

/**
 * Конфигурация текстов для сущности
 */
export interface EntityTexts {
  title: string;
  titleCreate: string;
  titleManage: string;
  description: string;
  titleLabel: string;
  placeholder: string;
  submitLabel: string;
  successMessage: string;
  searchPlaceholder: string;
  emptyText: string;
}

/**
 * Полная конфигурация сущности
 */
export interface EntityConfig {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  apiPath: string;
  service: EntityService;
  texts: EntityTexts;
}

/**
 * Тип всех доступных сущностей
 */
export type EntityType = 'tag' | 'category' | 'kitchen' | 'badge';

/**
 * Централизованный реестр всех сущностей админ-панели
 * 
 * Содержит всю конфигурацию для работы с сущностями:
 * - UI конфигурация (id, label, icon)
 * - API конфигурация (apiPath, service методы)
 * - Тексты и сообщения
 * - Конфигурация поиска
 */
export const ENTITY_REGISTRY: Record<EntityType, EntityConfig> = {
  tag: {
    id: 'tags',
    label: 'Теги',
    icon: TagIcon,
    apiPath: '/tags',
    service: {
      getAll: (options?: { force?: boolean }) => tagsService.getAll(options),
      search: (name: string) => tagsService.search(name),
      update: (id: string, name: string) => tagsService.update(id, name),
    },
    texts: {
      title: 'Тег',
      titleCreate: 'Создать тег',
      titleManage: 'Управление тегами',
      description: 'Создайте новый тег для категоризации рецептов. Теги помогают пользователям быстро находить нужные рецепты.',
      titleLabel: 'Название тега*',
      placeholder: 'Например: Десерт, Завтрак, Веганское...',
      submitLabel: 'Создать тег',
      successMessage: 'Тег успешно создан',
      searchPlaceholder: 'Поиск тегов (мин. 3 символа)',
      emptyText: 'Теги не найдены',
    },
  },
  category: {
    id: 'categories',
    label: 'Категории',
    icon: FolderIcon,
    apiPath: '/categories',
    service: {
      getAll: (options?: { force?: boolean }) => CategoriesService.getAll(options),
      search: (name: string) => CategoriesService.search(name),
      update: (id: string, name: string) => CategoriesService.update(id, name),
      clearCache: () => CategoriesService.clearCache(),
    },
    texts: {
      title: 'Категория',
      titleCreate: 'Создать категорию',
      titleManage: 'Управление категориями',
      description: 'Создайте новую категорию продуктов. Категории помогают группировать продукты и ускоряют поиск.',
      titleLabel: 'Название категории*',
      placeholder: 'Например: Молочные продукты, Фрукты, Выпечка...',
      submitLabel: 'Создать категорию',
      successMessage: 'Категория успешно создана',
      searchPlaceholder: 'Поиск категорий (мин. 3 символа)',
      emptyText: 'Категории не найдены',
    },
  },
  kitchen: {
    id: 'kitchens',
    label: 'Кухни',
    icon: Squares2X2Icon,
    apiPath: '/kitchens',
    service: {
      getAll: (options?: { force?: boolean }) => KitchensService.getAll(options),
      search: (name: string) => KitchensService.search(name),
      update: (id: string, name: string) => KitchensService.update(id, name),
      clearCache: () => KitchensService.clearCache(),
    },
    texts: {
      title: 'Кухня',
      titleCreate: 'Создать кухню',
      titleManage: 'Управление кухнями',
      description: 'Создайте новую кухню. Кухни помогают фильтровать и категоризировать рецепты.',
      titleLabel: 'Название кухни*',
      placeholder: 'Например: Русская, Итальянская, Японская...',
      submitLabel: 'Создать кухню',
      successMessage: 'Кухня успешно создана',
      searchPlaceholder: 'Поиск кухонь (мин. 3 символа)',
      emptyText: 'Кухни не найдены',
    },
  },
  badge: {
    id: 'badges',
    label: 'Бейджи',
    icon: TrophyIcon,
    apiPath: '/badges',
    service: {
      getAll: (options?: { force?: boolean }) => BadgesService.getAll(options),
      search: (name: string) => BadgesService.search(name),
      update: (id: string, name: string) => BadgesService.update(id, name),
      clearCache: () => BadgesService.clearCache(),
    },
    texts: {
      title: 'Бейдж',
      titleCreate: 'Создать бейдж',
      titleManage: 'Управление бейджами',
      description: 'Создайте новый бейдж для награждения пользователей и рецептов. Бейджи мотивируют пользователей и отмечают достижения.',
      titleLabel: 'Название бейджа*',
      placeholder: 'Например: Мастер кулинарии, Звезда рецептов...',
      submitLabel: 'Создать бейдж',
      successMessage: 'Бейдж успешно создан',
      searchPlaceholder: 'Поиск бейджей (мин. 3 символа)',
      emptyText: 'Бейджи не найдены',
    },
  },
};

