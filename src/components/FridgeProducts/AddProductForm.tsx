import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store';
import { mockApi } from '../../services/mockApi';
import { allPossibleUnits } from '../../data';
import type { Ingredient } from '../../types';
import styles from './AddProductForm.module.css';

interface AddProductFormProps {
  onSubmit: (productData: {
    ingredient: Ingredient;
    amount: number;
    unit: string;
    expiryDate?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit, onCancel }) => {
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Загружаем ингредиенты при монтировании компонента
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setIngredientsLoading(true);
        const ingredients = await mockApi.getIngredients();
        setAvailableIngredients(ingredients);
      } catch (error) {
        console.error('Ошибка при загрузке ингредиентов:', error);
      } finally {
        setIngredientsLoading(false);
      }
    };

    loadIngredients();
  }, []);

  // Сбрасываем единицу измерения при выборе ингредиента
  useEffect(() => {
    if (selectedIngredient) {
      setUnit(''); // Пользователь выберет единицу сам
    }
  }, [selectedIngredient]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedIngredient) {
      newErrors.ingredient = 'Выберите продукт';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Введите корректное количество';
    }

    if (!unit) {
      newErrors.unit = 'Выберите единицу измерения';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedIngredient) return;

    onSubmit({
      ingredient: selectedIngredient,
      amount: parseFloat(amount),
      unit,
      expiryDate: expiryDate || undefined,
      notes: notes || undefined
    });
  };

  const handleIngredientSelect = (ingredient: Ingredient | null) => {
    setSelectedIngredient(ingredient);
    setErrors(prev => ({ ...prev, ingredient: '' }));
  };

  return (
    <div className={styles.addProductForm}>
      <div className={styles.formHeader}>
        <h3>Добавить продукт</h3>
        <button 
          type="button" 
          className={styles.closeButton}
          onClick={onCancel}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Продукт *
            {errors.ingredient && <span className={styles.error}>{errors.ingredient}</span>}
          </label>
          <select
            value={selectedIngredient?.id || ''}
            onChange={(e) => {
              const ingredient = availableIngredients.find(ing => ing.id === e.target.value);
              handleIngredientSelect(ingredient || null);
            }}
            className={`${styles.select} ${errors.ingredient ? styles.inputError : ''}`}
            disabled={ingredientsLoading}
          >
            <option value="">
              {ingredientsLoading ? 'Загрузка ингредиентов...' : 'Выберите продукт...'}
            </option>
            {availableIngredients.map(ingredient => (
              <option key={ingredient.id} value={ingredient.id}>
                {ingredient.name} ({ingredient.category.name})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Количество *
              {errors.amount && <span className={styles.error}>{errors.amount}</span>}
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrors(prev => ({ ...prev, amount: '' }));
              }}
              className={`${styles.input} ${errors.amount ? styles.inputError : ''}`}
              placeholder="0"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Единица измерения *
              {errors.unit && <span className={styles.error}>{errors.unit}</span>}
            </label>
            <select
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                setErrors(prev => ({ ...prev, unit: '' }));
              }}
              className={`${styles.select} ${errors.unit ? styles.inputError : ''}`}
            >
              <option value="">Выберите единицу</option>
              {allPossibleUnits.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Срок годности</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className={styles.input}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Заметки</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.textarea}
            placeholder="Дополнительная информация о продукте..."
            rows={3}
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={ingredientsLoading}
          >
            {ingredientsLoading ? 'Загрузка...' : 'Добавить продукт'}
          </button>
        </div>
      </form>
    </div>
  );
}; 