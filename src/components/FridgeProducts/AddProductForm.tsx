import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store';
import { ingredientsService } from '../../services/ingredientsService';
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
        console.log('Начинаем загрузку ингредиентов...');
        
        // Используем новый API сервис
        const ingredients = await ingredientsService.getIngredientsForFridge();
        console.log('Загружено ингредиентов:', ingredients.length);
        
        setAvailableIngredients(ingredients);
        setErrors(prev => ({ ...prev, api: '' })); // Очищаем ошибки при успешной загрузке
      } catch (error) {
        console.error('Ошибка при загрузке ингредиентов:', error);
        // В случае ошибки показываем сообщение пользователю
        setErrors({ api: 'Ошибка загрузки ингредиентов. Проверьте подключение к интернету.' });
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
                  const ingredients = await ingredientsService.getIngredientsForFridge();
                  setAvailableIngredients(ingredients);
                  if (ingredients.length === 0) {
                    setErrors({ api: 'API вернул пустой список. Возможно, данные еще не добавлены в систему.' });
                  }
                } catch (error) {
                  setErrors({ api: 'Ошибка подключения к API. Проверьте интернет соединение.' });
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
            <p>🍽️ Список ингредиентов пуст</p>
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
              {ingredientsLoading ? 'Загрузка ингредиентов...' : 
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