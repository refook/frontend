import React, { useState } from 'react';
import Tabs from '../../../../components/Tabs/Tabs';
import CreateProductForm from '../CreateProductForm/CreateProductForm';
import ProductListSubTab from '../ProductListSubTab/ProductListSubTab';
import styles from './ProductSubTabs.module.css';

/**
 * Компонент подвкладок для раздела "Продукты" в админ-панели.
 * 
 * Предоставляет вложенную навигацию с возможностью переключения между:
 * - Созданием нового продукта
 * - Просмотром предложений пользователей
 * 
 * @component
 * @example
 * // Использование в AdminPage
 * {activeTab === 'products' && (
 *   <ProductSubTabs />
 * )}
 * 
 * @since 1.0.0
 * @author Frontend Team
 */
const ProductSubTabs: React.FC = () => {
  /** 
   * Состояние активной вкладки
   * @type {string} - ID активной вкладки ('create' | 'suggestions')
   * @default 'create'
   */
  const [active, setActive] = useState<string>('create');

  /**
   * Конфигурация доступных вкладок
   * @type {Array<{id: string, label: string}>}
   */
  const tabs = [
    { id: 'create', label: 'Создать продукт' },
    { id: 'list', label: 'Список' },
    { id: 'suggestions', label: 'Предложения пользователей' },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Компонент вкладок для переключения между подразделами */}
      <Tabs initial={active} onChange={setActive} tabs={tabs} ariaLabel="Подразделы продуктов" />
      
      <div className={styles.content}>
        {/* Контент вкладки "Создать продукт" */}
        {active === 'create' && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Создать продукт</div>
            <CreateProductForm />
          </div>
        )}
        
        {/* Контент вкладки "Список продуктов" */}
        {active === 'list' && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Список продуктов</div>
            <ProductListSubTab />
          </div>
        )}
        
        {/* Контент вкладки "Предложения пользователей" */}
        {active === 'suggestions' && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Предложения пользователей</div>
            <div className={styles.placeholder}>
              Здесь будут предложения пользователей по новым продуктам.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSubTabs;
