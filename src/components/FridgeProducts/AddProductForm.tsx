import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store';
import { API_BASE_URL } from '../../services/api';
import { getAuthHeaders, authorizedFetch } from '../../services/auth';
import { BASE_UNITS_ARRAY, PRODUCT_UNITS_ARRAY } from '../../constants/measures';
import type { ApiIngredient } from '../../types/ingredient.types';
import styles from './AddProductForm.module.css';

interface AddProductFormProps {
  onSubmit: (productData: {
    ingredient: ApiIngredient;
    amount: number;
    unit: string;
    baseUnit?: 'GR' | 'ML';
    expiryDate?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit, onCancel }) => {
  const [availableIngredients, setAvailableIngredients] = useState<ApiIngredient[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);
  const [selectedIngredient, setSelectedIngredient] = useState<ApiIngredient | null>(null);
  const [amount, setAmount] = useState<string>('1');
  const [unit, setUnit] = useState<string>('');
  const [baseUnit, setBaseUnit] = useState<'GR' | 'ML' | ''>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Временная загрузка продуктов через новый эндпоинт products/all
  const fetchProducts = async (): Promise<ApiIngredient[]> => {
    const headers = getAuthHeaders();

    const response = await authorizedFetch(`${API_BASE_URL}/products/all`, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const products = await response.json();
    return products as ApiIngredient[];
  };

  // Загружаем ингредиенты при монтировании компонента
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setIngredientsLoading(true);
        console.log('Начинаем загрузку ингредиентов...');
        
        // Новый эндпоинт: products вместо ingredients
        const ingredients = await fetchProducts();
        console.log('Загружено ингредиентов:', ingredients.length);
        
        setAvailableIngredients(ingredients);
        setErrors(prev => ({ ...prev, api: '' })); // Очищаем ошибки при успешной загрузке
      } catch (error) {
        console.error('Ошибка при загрузке ингредиентов:', error);
        // В случае ошибки показываем сообщение пользователю
        setErrors({ api: 'Ошибка загрузки продуктов. Проверьте подключение к интернету.' });
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

    if (!baseUnit) {
      newErrors.baseUnit = 'Выберите базовую единицу';
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
      baseUnit: baseUnit || undefined,
      expiryDate: expiryDate || undefined,
      notes: notes || undefined
    });
  };

  const handleIngredientSelect = (ingredient: ApiIngredient | null) => {
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
        {errors.api && (
          <div className={styles.apiError}>
            <p>{errors.api}</p>
            <button 
              type="button" 
              className={styles.retryButton}
              onClick={async () => {
                setErrors(prev => ({ ...prev, api: '' }));
                setIngredientsLoading(true);
                try {
                  const ingredients = await fetchProducts();
                  setAvailableIngredients(ingredients);
                  if (ingredients.length === 0) {
                    setErrors({ api: 'API вернул пустой список продуктов. Возможно, данные еще не добавлены в систему.' });
                  }
                } catch (error) {
                  setErrors({ api: 'Ошибка подключения к API продуктов. Проверьте интернет соединение.' });
                } finally {
                  setIngredientsLoading(false);
                }
              }}
            >
              Попробовать снова
            </button>
          </div>
        )}

        {availableIngredients.length === 0 && !ingredientsLoading && !errors.api && (
          <div className={styles.emptyState}>
            <p>🍽️ Список продуктов пуст</p>
            <p>Возможно, администратор еще не добавил продукты в систему</p>
          </div>
        )}

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
            disabled={ingredientsLoading || !!errors.api}
          >
            <option value="">
              {ingredientsLoading ? 'Загрузка продуктов...' : 
               errors.api ? 'Ошибка загрузки...' :
               'Выберите продукт...'}
            </option>
            {availableIngredients.map(ingredient => (
              <option key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
                {ingredient.description && ` - ${ingredient.description}`}
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
                const nextUnit = e.target.value;
                setUnit(nextUnit);
                // Автоподстановка baseUnit из выбранной единицы
                const u = (nextUnit || '').toUpperCase();
                const inferredBase = (u === 'ML' || u === 'L' || u === 'MILLILITER' || u === 'LITER') ? 'ML' : (u ? 'GR' : '');
                if (inferredBase) setBaseUnit(inferredBase as 'GR' | 'ML');
                setErrors(prev => ({ ...prev, unit: '' }));
              }}
              className={`${styles.select} ${errors.unit ? styles.inputError : ''}`}
            >
              <option value="">Выберите единицу</option>
              {PRODUCT_UNITS_ARRAY.map(u => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Базовая единица продукта *
            {errors.baseUnit && <span className={styles.error}>{errors.baseUnit}</span>}
          </label>
          <select
            value={baseUnit}
            onChange={(e) => {
              setBaseUnit(e.target.value as 'GR' | 'ML');
              setErrors(prev => ({ ...prev, baseUnit: '' }));
            }}
            className={`${styles.select} ${errors.baseUnit ? styles.inputError : ''}`}
          >
            <option value="">Выберите базовую единицу</option>
            {BASE_UNITS_ARRAY.map(bu => (
              <option key={bu.value} value={bu.value}>
                {bu.label}
              </option>
            ))}
          </select>
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
            className={`${styles.cancelButton} ui-btn ui-btn--ghost`}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={`${styles.submitButton} ui-btn ui-btn--primary`}
            disabled={ingredientsLoading}
          >
            {ingredientsLoading ? 'Загрузка...' : 'Добавить продукт'}
          </button>
        </div>
      </form>
    </div>
  );
}; 