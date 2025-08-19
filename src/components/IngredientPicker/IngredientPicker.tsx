import React, { useState, useRef, useEffect } from 'react';
import type { ProductUnitType } from '../../types/measures.types';
import { API_BASE_URL } from '../../services/api';
import { PRODUCT_UNITS_ARRAY } from '../../constants/measures';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './IngredientPicker.module.css';
import type {ApiIngredient, CreateRecipeIngredientDto} from "../../types";

interface IngredientPickerProps {
  ingredients: CreateRecipeIngredientDto[];
  onChange: (ingredients: CreateRecipeIngredientDto[]) => void;
  errors?: Record<string, string>;
  compact?: boolean;
}

const IngredientPicker: React.FC<IngredientPickerProps> = ({
  ingredients,
  onChange,
  errors = {},
  compact = false
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<ApiIngredient | null>(null);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [availableIngredients, setAvailableIngredients] = useState<ApiIngredient[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Загружаем продукты (ингредиенты) из нового API
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setIngredientsLoading(true);
        console.log('IngredientPicker: Загрузка продуктов из API /products/all ...');
        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const resp = await fetch(`${API_BASE_URL}/products/all`, { headers });
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const apiProducts = await resp.json();
        setAvailableIngredients(apiProducts);
        console.log(`IngredientPicker: Загружено ${apiProducts.length} продуктов`);
      } catch (error) {
        console.error('IngredientPicker: Ошибка при загрузке продуктов:', error);
        // При ошибке API оставляем пустой массив
        setAvailableIngredients([]);
      } finally {
        setIngredientsLoading(false);
      }
    };

    loadIngredients();
  }, []);

  // Список продуктовых единиц измерения
  const units = PRODUCT_UNITS_ARRAY.map(u => u.value);

  const suggestions = availableIngredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !ingredients.some(ing => ing.id === ingredient.id) &&
    searchTerm.length > 0
  );

  const addIngredient = () => {
    if (selectedIngredient && amount.trim()) {
      const newIngredient: CreateRecipeIngredientDto = {
        id: selectedIngredient.id,
        count: parseInt(amount.trim()) || 0,
        productUnit: unit as ProductUnitType
      };
      
      onChange([...ingredients, newIngredient]);
      
      // Сбрасываем форму
      setSelectedIngredient(null);
      setSearchTerm('');
      setAmount('');
      setUnit('');
      setShowForm(false);
      setShowSuggestions(false);
    }
  };

  const removeIngredient = (id: string) => {
    onChange(ingredients.filter(ing => ing.id !== id));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
    setSelectedIngredient(null);
  };

  const handleSuggestionClick = (ingredient: ApiIngredient) => {
    setSelectedIngredient(ingredient);
    setSearchTerm(ingredient.name);
    // Устанавливаем единицу измерения из API
    if ((ingredient as any).productUnit || (ingredient as any).measure) {
      setUnit(((ingredient as any).productUnit || (ingredient as any).measure) as string);
    } else {
      setUnit('GR'); // По умолчанию граммы
    }
    setShowSuggestions(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addIngredient();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={styles.ingredientPicker}>
      {/* Список ингредиентов */}
      <div className={styles.ingredientsList}>
        {ingredients.map((ingredient, index) => (
          <div key={ingredient.id} className={styles.ingredientItem}>
            <div className={styles.ingredientInfo}>
              <span className={styles.ingredientName}>
                {availableIngredients.find(i => i.id === ingredient.id)?.name || 'Неизвестный ингредиент'}
              </span>
              <span className={styles.ingredientAmount}>
                {ingredient.count} {PRODUCT_UNITS_ARRAY.find(m => m.value === (ingredient as any).productUnit)?.label}
              </span>
              {errors[`ingredients.${index}.count`] && (
                <span className={styles.errorText}>
                  {errors[`ingredients.${index}.count`]}
                </span>
              )}
              {errors[`ingredients.${index}.measure`] && (
                <span className={styles.errorText}>
                  {errors[`ingredients.${index}.measure`]}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeIngredient(ingredient.id)}
              className={styles.removeButton}
              title={`Удалить ингредиент "${availableIngredients.find(i => i.id === ingredient.id)?.name || 'Неизвестный ингредиент'}"`}
            >
              <XMarkIcon className={styles.removeIcon} />
            </button>
          </div>
        ))}
      </div>

      {/* Форма добавления */}
      {showForm ? (
        <div className={styles.addForm}>
          <div className={styles.formRow}>
            <div className={styles.nameGroup}>
              <label className={styles.label}>Название *</label>
              <div className={styles.inputContainer}>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder={ingredientsLoading ? "Загрузка..." : "Начните вводить название"}
                  className={styles.input}
                  disabled={ingredientsLoading}
                  required
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {suggestions.slice(0, 5).map(ingredient => (
                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() => handleSuggestionClick(ingredient)}
                        className={styles.suggestion}
                      >
                        {ingredient.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.amountGroup}>
              <label className={styles.label}>Количество</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className={styles.input}
              />
            </div>

            <div className={styles.unitGroup}>
              <label className={styles.label}>Единица</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={styles.select}
              >
                <option value="">Выберите</option>
                {PRODUCT_UNITS_ARRAY.map(u => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSelectedIngredient(null);
                setSearchTerm('');
                setAmount('');
                setUnit('');
                setShowSuggestions(false);
              }}
              className={styles.cancelButton}
            >
              Отмена
            </button>
            <button
              type="button"
              className={styles.addButton}
              onClick={addIngredient}
              disabled={!selectedIngredient || !amount.trim()}
            >
              Добавить
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setTimeout(() => nameInputRef.current?.focus(), 100);
          }}
          className={styles.showFormButton}
        >
          <PlusIcon className={styles.plusIcon} />
          Добавить ингредиент
        </button>
      )}
    </div>
  );
};

export default IngredientPicker; 