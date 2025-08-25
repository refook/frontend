import React, { useState } from 'react';
import { API_BASE_URL } from '../../../../services/api';
import { BASE_UNITS_ARRAY, PRODUCT_UNITS_ARRAY } from '../../../../constants/measures';
import styles from './CreateProductForm.module.css';

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

const CreateProductForm: React.FC = () => {
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
    <form onSubmit={handleSubmit} className={styles.formGrid}>
      <label className={styles.label}>
        Название*
        <input
          className={styles.input}
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </label>
      <label className={styles.label}>
        Описание
        <textarea
          className={styles.textarea}
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </label>
      <label className={styles.label}>
        Базовая мера*
        <select
          className={styles.select}
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
      <label className={styles.label}>
        Конкретная мера*
        <select
          className={styles.select}
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
      <label className={styles.label}>
        Средний вес (г)*
        <input
          className={styles.input}
          type="number"
          min={0}
          step={1}
          value={formData.avgWeight}
          onChange={(e) => setFormData({ ...formData, avgWeight: Number(e.target.value) })}
          required
        />
      </label>
      <label className={styles.label}>
        URL фото
        <input
          className={styles.input}
          type="url"
          value={formData.photo}
          onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
          placeholder="https://..."
        />
      </label>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>КБЖУ*</legend>
        <div className={styles.row4}>
          <label className={styles.label}>
            Ккал
            <input
              className={styles.input}
              type="number"
              min={0}
              step={1}
              value={formData.macros.calories}
              onChange={(e) => setFormData({ ...formData, macros: { ...formData.macros, calories: Number(e.target.value) } })}
              required
            />
          </label>
          <label className={styles.label}>
            Белки
            <input
              className={styles.input}
              type="number"
              min={0}
              step={0.01}
              value={formData.macros.proteins}
              onChange={(e) => setFormData({ ...formData, macros: { ...formData.macros, proteins: Number(e.target.value) } })}
              required
            />
          </label>
          <label className={styles.label}>
            Жиры
            <input
              className={styles.input}
              type="number"
              min={0}
              step={0.01}
              value={formData.macros.fats}
              onChange={(e) => setFormData({ ...formData, macros: { ...formData.macros, fats: Number(e.target.value) } })}
              required
            />
          </label>
          <label className={styles.label}>
            Углеводы
            <input
              className={styles.input}
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
        {message && (
          <div
            aria-live="polite"
            className={`${styles.message} ${message.startsWith('Ошибка') ? styles.messageError : styles.messageSuccess}`}
          >
            {message}
          </div>
        )}
      </div>
    </form>
  );
};

export default CreateProductForm;


