import React, { useState } from 'react';
import { API_BASE_URL } from '../../services/api';
import { BASE_UNITS_ARRAY, PRODUCT_UNITS_ARRAY } from '../../constants/measures';
import styles from './AdminPage.module.css';
import Tabs from '../../components/Tabs/Tabs';
import { Cog6ToothIcon, UserGroupIcon, BookOpenIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

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
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <label>
                Название*
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Описание
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </label>
              <label>
                Базовая мера*
                <select
                  value={formData.baseUnit}
                  onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value as BaseUnitType })}
                  required
                >
                  {BASE_UNITS_ARRAY.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Конкретная мера*
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnitType })}
                  required
                >
                  {PRODUCT_UNITS_ARRAY.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Средний вес (г)*
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={formData.avgWeight}
                  onChange={(e) => setFormData({ ...formData, avgWeight: Number(e.target.value) })}
                  required
                />
              </label>
              <label>
                URL фото
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://..."
                />
              </label>
              <fieldset className={styles.card}>
                <legend>КБЖУ*</legend>
                <div className={styles.row4}>
                  <label>
                    Ккал
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={formData.macros.calories}
                      onChange={(e) => setFormData({ ...formData, macros: { ...formData.macros, calories: Number(e.target.value) } })}
                      required
                    />
                  </label>
                  <label>
                    Белки
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.macros.proteins}
                      onChange={(e) => setFormData({ ...formData, macros: { ...formData.macros, proteins: Number(e.target.value) } })}
                      required
                    />
                  </label>
                  <label>
                    Жиры
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.macros.fats}
                      onChange={(e) => setFormData({ ...formData, macros: { ...formData.macros, fats: Number(e.target.value) } })}
                      required
                    />
                  </label>
                  <label>
                    Углеводы
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.macros.carbs}
                      onChange={(e) => setFormData({ ...formData, macros: { ...formData.macros, carbs: Number(e.target.value) } })}
                      required
                    />
                  </label>
                </div>
              </fieldset>
              <div className={styles.actions}>
                <button type="submit" className="ui-btn ui-btn--primary" disabled={submitting}>
                  {submitting ? 'Сохранение...' : 'Создать продукт'}
                </button>
                {message && <div aria-live="polite">{message}</div>}
              </div>
            </form>
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


