import React, { useState } from 'react';
import Tabs from '../../../../components/Tabs/Tabs';
import CreateTagForm from '../CreateTagForm/CreateTagForm';
import styles from './TagSubTabs.module.css';
import TagManager from '../TagManager/TagManager';

/**
 * Компонент подвкладок для раздела "Теги" в админ-панели.
 * 
 * Предоставляет вложенную навигацию с возможностью переключения между:
 * - Созданием нового тега
 * - Управлением существующими тегами (будущая функциональность)
 * 
 * @component
 * @example
 * // Использование в AdminPage
 * {activeTab === 'tags' && (
 *   <TagSubTabs />
 * )}
 * 
 * @features
 * - Переиспользует компонент Tabs для навигации
 * - Интегрирует CreateTagForm для создания тегов
 * - Заглушка для управления существующими тегами
 * - Легко расширяется для добавления новых подвкладок
 * 
 * @since 1.0.0
 * @author Frontend Team
 */
const TagSubTabs: React.FC = () => {
  /** 
   * Состояние активной вкладки
   * @type {string} - ID активной вкладки ('create' | 'manage')
   * @default 'create'
   */
  const [active, setActive] = useState<string>('create');

  /**
   * Конфигурация доступных вкладок
   * @type {Array<{id: string, label: string}>}
   */
  const tabs = [
    { id: 'create', label: 'Создать тег' },
    { id: 'manage', label: 'Управление тегами' },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Компонент вкладок для переключения между подразделами */}
      <Tabs initial={active} onChange={setActive} tabs={tabs} ariaLabel="Подразделы тегов" />
      
      <div className={styles.content}>
        {/* Контент вкладки "Создать тег" */}
        {active === 'create' && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Создать тег</div>
            <div className={styles.cardDescription}>
              Создайте новый тег для категоризации рецептов. Теги помогают пользователям быстро находить нужные рецепты.
            </div>
            <CreateTagForm />
          </div>
        )}
        
        {/* Контент вкладки "Управление тегами" */}
        {active === 'manage' && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Управление тегами</div>
            <TagManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSubTabs;
