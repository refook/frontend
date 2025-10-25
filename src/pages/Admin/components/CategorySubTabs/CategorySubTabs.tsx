import React from 'react';
import AdminCard from '../AdminCard/AdminCard';
import CreateTagForm from '../CreateTagForm/CreateTagForm';
import CategoryManager from '../CategoryManager/CategoryManager';
import styles from './CategorySubTabs.module.css';
import { CategoriesService } from '../../../../services/categoriesService';
import {API_BASE_URL} from "../../../../services/api.ts";

interface CategorySubTabsProps {
  mode: 'create' | 'manage';
}

const CategorySubTabs: React.FC<CategorySubTabsProps> = ({ mode }) => {
  if (mode === 'manage') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <AdminCard title="Управление категориями">
            <CategoryManager />
          </AdminCard>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <AdminCard
          title="Создать категорию"
          description="Создайте новую категорию продуктов. Категории помогают группировать продукты и ускоряют поиск."
        >
          <CreateTagForm
            apiUrl={`${API_BASE_URL}/categories`}
            titleLabel="Название категории*"
            placeholder="Например: Молочные продукты, Фрукты, Выпечка..."
            submitLabel="Создать категорию"
            successMessage="Категория успешно создана"
            onCreated={() => {
              CategoriesService.clearCache();
            }}
          />
        </AdminCard>
      </div>
    </div>
  );
};

export default CategorySubTabs;
