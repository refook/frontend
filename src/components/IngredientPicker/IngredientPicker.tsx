import React, { useState, useRef } from 'react';
import type { FormIngredient } from '../../types';
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
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Популярные ингредиенты для автокомплита
  const popularIngredients = [
    'мука', 'сахар', 'яйца', 'молоко', 'масло сливочное', 'масло растительное',
    'соль', 'перец', 'лук', 'чеснок', 'морковь', 'картофель', 'томаты',
    'курица', 'говядина', 'свинина', 'рыба', 'рис', 'гречка', 'макароны',
    'сыр', 'творог', 'сметана', 'кефир', 'хлеб', 'петрушка', 'укроп',
    'базилик', 'орегано', 'тимьян', 'лавровый лист', 'паприка', 'куркума'
  ];

  const units = [
    'г', 'кг', 'мл', 'л', 'шт', 'ст.л.', 'ч.л.', 'стакан', 'щепотка', 'по вкусу'
  ];

  const suggestions = popularIngredients.filter(ingredient => 
    ingredient.toLowerCase().includes(name.toLowerCase()) &&
    !ingredients.some(ing => ing.name.toLowerCase() === ingredient.toLowerCase()) &&
    name.length > 0
  );

  const addIngredient = () => {
    if (name.trim()) {
      const newIngredient: FormIngredient = {
        id: `ing-${Date.now()}`,
        name: name.trim(),
        amount: amount.trim(),
        unit: unit.trim()
      };
      
      onChange([...ingredients, newIngredient]);
      
      // Сбрасываем форму
      setName('');
      setAmount('');
      setUnit('');
      setShowForm(false);
      setShowSuggestions(false);
    }
  };

  const removeIngredient = (id: string) => {
    onChange(ingredients.filter(ing => ing.id !== id));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setName(suggestion);
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
                  value={name}
                  onChange={handleNameChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(name.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Начните вводить название"
                  className={styles.input}
                  required
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {suggestions.slice(0, 5).map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={styles.suggestion}
                      >
                        {suggestion}
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
                setName('');
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
              disabled={!name.trim()}
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