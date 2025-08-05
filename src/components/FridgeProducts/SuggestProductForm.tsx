import React, { useState } from 'react';
import { MEASURES_ARRAY } from '../../constants/measures';
import type { MeasureType } from '../../types/measures.types';
import styles from './SuggestProductForm.module.css';

interface SuggestProductFormProps {
  onSubmit: (data: { name: string; description: string; measure: MeasureType }) => void;
  onCancel: () => void;
}

export const SuggestProductForm: React.FC<SuggestProductFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    measure: 'KG' as MeasureType // По умолчанию килограммы
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Предложить новый продукт</h3>
      
      <div className={styles.field}>
        <label htmlFor="name">Название продукта*</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Например: Авокадо"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Описание</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Краткое описание продукта"
          rows={3}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="measure">Единица измерения*</label>
        <select
          id="measure"
          value={formData.measure}
          onChange={(e) => setFormData({ ...formData, measure: e.target.value as MeasureType })}
          required
        >
          {MEASURES_ARRAY.map(measure => (
            <option key={measure.value} value={measure.value}>
              {measure.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.buttons}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Отмена
        </button>
        <button type="submit" className={styles.submitButton}>
          Предложить продукт
        </button>
      </div>
    </form>
  );
};