import React, { useState } from 'react';
import { API_BASE_URL } from '../../services/api';
import { BASE_UNITS_ARRAY, PRODUCT_UNITS_ARRAY } from '../../constants/measures';
import styles from './AdminPage.module.css';
import Tabs from '../../components/Tabs/Tabs';
import { Cog6ToothIcon, UserGroupIcon, BookOpenIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import CreateProductForm from './components/CreateProductForm/CreateProductForm';

type BaseUnitType = (typeof BASE_UNITS_ARRAY)[number]['value'];
type ProductUnitType = (typeof PRODUCT_UNITS_ARRAY)[number]['value'];

interface CreateProductDtoForm {
  name: string;
  description: string;
  baseUnit: BaseUnitType;
  avgWeight: number;
  unit: ProductUnitType;
  photo: string;
  macros: {
    calories: number;
    proteins: number;
    fats: number;
    carbs: number;
  };
}

type TabKey = 'products' | 'recipes' | 'users' | 'settings';

const AdminPage: React.FC = () => {
  const [formData, setFormData] = useState<CreateProductDtoForm>({
    name: '',
    description: '',
    baseUnit: 'GR',
    avgWeight: 100,
    unit: 'GRAM',
    photo: '',
    macros: { calories: 0, proteins: 0, fats: 0, carbs: 0 },
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('products');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      setMessage('Продукт успешно создан');
      setFormData({
        name: '',
        description: '',
        baseUnit: 'GR',
        avgWeight: 100,
        unit: 'GRAM',
        photo: '',
        macros: { calories: 0, proteins: 0, fats: 0, carbs: 0 },
      });
    } catch (err) {
      setMessage(`Ошибка: ${err instanceof Error ? err.message : 'Не удалось создать продукт'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Админ-панель</h1>
      </div>

      <Tabs
        initial={activeTab}
        onChange={(t) => setActiveTab(t as TabKey)}
        tabs={[
          { id: 'products', label: 'Продукты', Icon: Squares2X2Icon },
          { id: 'recipes', label: 'Рецепты', Icon: BookOpenIcon },
          { id: 'users', label: 'Пользователи', Icon: UserGroupIcon },
          { id: 'settings', label: 'Настройки', Icon: Cog6ToothIcon },
        ]}
        ariaLabel="Admin sections"
      />

      <div className={styles.content}>
        {activeTab === 'products' && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Создать продукт</div>
            <CreateProductForm />
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Рецепты (скоро)</div>
            <p>Здесь появится управление рецептами.</p>
          </div>
        )}
        {activeTab === 'users' && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Пользователи (скоро)</div>
            <p>Здесь появится управление пользователями.</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Настройки (скоро)</div>
            <p>Общие настройки системы.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;


