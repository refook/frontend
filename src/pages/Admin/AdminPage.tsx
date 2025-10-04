import React, { useState } from 'react';
import styles from './AdminPage.module.css';
import Tabs from '../../components/Tabs/Tabs';
import { Cog6ToothIcon, UserGroupIcon, BookOpenIcon, Squares2X2Icon, TagIcon, FolderIcon } from '@heroicons/react/24/outline';
import ProductSubTabs from './components/ProductSubTabs/ProductSubTabs';
import CreateProductForm from './components/CreateProductForm/CreateProductForm';
import ProductListSubTab from './components/ProductListSubTab/ProductListSubTab';
import TagSubTabs from './components/TagSubTabs/TagSubTabs';
import KitchenSubTabs from './components/KitchenSubTabs/KitchenSubTabs';
import CategorySubTabs from './components/CategorySubTabs/CategorySubTabs';

/**
 * Тип ключей доступных вкладок админ-панели
 * @typedef {'products' | 'recipes' | 'tags' | 'users' | 'settings' | 'categories' | 'kitchens'} TabKey
 */
type TabKey = 'products' | 'recipes' | 'tags' | 'users' | 'settings' | 'kitchens' | 'categories';

/**
 * Главная страница админ-панели с управлением системными функциями.
 * 
 * Предоставляет централизованный интерфейс для администрирования различных
 * разделов приложения: продукты, рецепты, теги, пользователи и настройки.
 * 
 * @component
 * @example
 * // Использование в роутинге
 * <Route path="/admin" element={<AdminPage />} />
 * 
 * @features
 * - Табованная навигация между разделами
 * - Вложенные компоненты для каждого раздела
 * - Responsive дизайн
 * - Поддержка темной темы
 * - Иконки для навигации
 * - Заглушки для будущих функций
 * 
 * @sections
 * - **Продукты**: Полнофункциональный раздел с подвкладками (создание, предложения)
 * - **Рецепты**: Заглушка для будущего управления рецептами
 * - **Теги**: Полнофункциональный раздел для управления тегами (создание, управление)
 * - **Пользователи**: Заглушка для управления пользователями
 * - **Настройки**: Заглушка для системных настроек
 * 
 * @since 1.0.0
 * @author Frontend Team
 */
const AdminPage: React.FC = () => {
  /**
   * Состояние активной вкладки админ-панели
   * @type {TabKey}
   * @default 'products'
   */
  const [activeTab, setActiveTab] = useState<TabKey>('products');

  return (
    <div className={styles.adminPage}>
      {/* Заголовок админ-панели */}
      <div className={styles.header}>
        <h1 className={styles.title}>Админ-панель</h1>
      </div>

      {/* Основная навигация по разделам */}
      <Tabs
        initial={activeTab}
        onChange={(t) => setActiveTab(t as TabKey)}
        tabs={[
          {
            id: 'products',
            label: 'Продукты',
            Icon: Squares2X2Icon,
            subtabs: [
              { id: 'products:create', label: 'Создание', title: 'Создать продукт', content: <CreateProductForm /> },
              { id: 'products:list', label: 'Список', title: 'Список продуктов', content: <ProductListSubTab /> },
              { id: 'products:suggest', label: 'Предложения', title: 'Предложения пользователей', content: (
                <div className={styles.placeholder}>Здесь будут предложения пользователей по новым продуктам.</div>
              ) },
            ],
          },
          { id: 'recipes', label: 'Рецепты', Icon: BookOpenIcon, title: 'Рецепты (скоро)', content: <p>Здесь появится управление рецептами.</p> },
          {
            id: 'tags',
            label: 'Теги',
            Icon: TagIcon,
            subtabs: [
              { id: 'tags:create', label: 'Создать', title: 'Создать тег', content: <TagSubTabs mode="create" /> },
              { id: 'tags:manage', label: 'Управление', title: 'Управление тегами', content: <TagSubTabs mode="manage" /> },
            ],
          },
          {
            id: 'categories',
            label: 'Категории',
            Icon: FolderIcon,
            subtabs: [
              { id: 'categories:create', label: 'Создать', title: 'Создать категорию', content: <CategorySubTabs mode="create" /> },
              { id: 'categories:manage', label: 'Управление', title: 'Управление категориями', content: <CategorySubTabs mode="manage" /> },
            ],
          },
          {
            id: 'kitchens',
            label: 'Кухни',
            Icon: Squares2X2Icon,
            subtabs: [
              { id: 'kitchens:create', label: 'Создать', title: 'Создать кухню', content: <KitchenSubTabs mode="create" /> },
              { id: 'kitchens:manage', label: 'Управление', title: 'Управление кухнями', content: <KitchenSubTabs mode="manage" /> },
            ],
          },
          { id: 'users', label: 'Пользователи', Icon: UserGroupIcon, title: 'Пользователи (скоро)', content: <p>Здесь появится управление пользователями.</p> },
          { id: 'settings', label: 'Настройки', Icon: Cog6ToothIcon, title: 'Настройки (скоро)', content: <p>Общие настройки системы.</p> },
        ]}
        ariaLabel="Admin sections"
      />

      {/* Контентная область с содержимым выбранной вкладки */}
      <div className={styles.content} />
    </div>
  );
};

export default AdminPage;

