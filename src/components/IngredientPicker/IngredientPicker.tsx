import React, { useState, useRef, useEffect } from 'react';
import type { FormIngredient, Ingredient } from '../../types';
import { ingredientsService } from '../../services/ingredientsService';
import { allPossibleUnits } from '../../data';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './IngredientPicker.module.css';

interface IngredientPickerProps {
  ingredients: FormIngredient[];
  onChange: (ingredients: FormIngredient[]) => void;
}

const IngredientPicker: React.FC<IngredientPickerProps> = ({
  ingredients,
  onChange
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Загружаем ингредиенты из API
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setIngredientsLoading(true);
        console.log('IngredientPicker: Загрузка ингредиентов из API...');
        const apiIngredients = await ingredientsService.getIngredientsForFridge();
        setAvailableIngredients(apiIngredients);
        console.log(`IngredientPicker: Загружено ${apiIngredients.length} ингредиентов`);
      } catch (error) {
        console.error('IngredientPicker: Ошибка при загрузке ингредиентов:', error);
        // При ошибке API оставляем пустой массив
        setAvailableIngredients([]);
      } finally {
        setIngredientsLoading(false);
      }
    };

    loadIngredients();
  }, []);

  const units = allPossibleUnits;

  const suggestions = availableIngredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !ingredients.some(ing => ing.name.toLowerCase() === ingredient.name.toLowerCase()) &&
    searchTerm.length > 0
  );

  const addIngredient = () => {
    if (selectedIngredient && amount.trim()) {
      const newIngredient: FormIngredient = {
        id: `ing-${Date.now()}`,
        name: selectedIngredient.name,
        amount: amount.trim(),
        unit: unit.trim() || 'шт'
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

  const handleSuggestionClick = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setSearchTerm(ingredient.name);
    setUnit(''); // Пользователь выберет единицу сам
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
        {ingredients.map((ingredient) => (
          <div key={ingredient.id} className={styles.ingredientItem}>
            <div className={styles.ingredientInfo}>
              <span className={styles.ingredientName}>{ingredient.name}</span>
              <span className={styles.ingredientAmount}>
                {ingredient.amount} {ingredient.unit}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeIngredient(ingredient.id)}
              className={styles.removeButton}
              title={`Удалить ингредиент "${ingredient.name}"`}
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
                        {ingredient.name} <span className={styles.category}>({ingredient.category.name})</span>
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
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
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