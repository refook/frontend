import React from 'react';
import CreateTagForm from '../CreateTagForm/CreateTagForm';
import styles from './TagSubTabs.module.css';
import AdminCard from '../AdminCard/AdminCard';
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
interface TagSubTabsProps { mode: 'create' | 'manage' }

const TagSubTabs: React.FC<TagSubTabsProps> = ({ mode }) => {
  if (mode === 'manage') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <AdminCard title="Управление тегами">
            <TagManager />
          </AdminCard>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <AdminCard
          title="Создать тег"
          description="Создайте новый тег для категоризации рецептов. Теги помогают пользователям быстро находить нужные рецепты."
        >
          <CreateTagForm
            apiUrl={`${import.meta.env.DEV ? '/api/v1' : 'https://api.refook.ru/v1'}/tags`}
            titleLabel="Название тега*"
            placeholder="Например: Десерт, Завтрак, Веганское..."
            submitLabel="Создать тег"
            successMessage="Тег успешно создан"
          />
        </AdminCard>
      </div>
    </div>
  );
};

export default TagSubTabs;
