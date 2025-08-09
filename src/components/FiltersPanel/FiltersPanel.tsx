import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setFilters, setSort, clearFilters } from '../../store/slices/recipesSlice';
import type {DifficultyLevel, KitchenType, RecipeFilters, RecipeSort} from '../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import styles from './FiltersPanel.module.css';

interface FiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { filters, sort } = useAppSelector(state => state.recipes);
  
  const [localFilters, setLocalFilters] = useState<RecipeFilters>(filters);
  const [localSort, setLocalSort] = useState<RecipeSort>(sort);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...localFilters, search: e.target.value };
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
  };

  const handleSortChange = (field: RecipeSort['field'], order: RecipeSort['order']) => {
    const newSort = { field, order };
    setLocalSort(newSort);
    dispatch(setSort(newSort));
  };

  const handleDifficultyChange = (difficulty: string) => {
    const currentDifficulties = localFilters.difficulty || [];
    const newDifficulties = currentDifficulties.includes(difficulty as DifficultyLevel)
      ? currentDifficulties.filter(d => d !== difficulty)
      : [...currentDifficulties, difficulty as DifficultyLevel];
    
    const newFilters = { ...localFilters, difficulty: newDifficulties };
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
  };

  const handleCuisineChange = (cuisine: string) => {
    const currentCuisines = localFilters.cuisine || [];
    const newCuisines = currentCuisines.includes(cuisine as KitchenType)
      ? currentCuisines.filter(c => c !== cuisine)
      : [...currentCuisines, cuisine as KitchenType];
    
    const newFilters = { ...localFilters, cuisine: newCuisines };
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
  };

  const handleTimeChange = (type: 'prepTime' | 'cookTime', value: string, field: 'min' | 'max') => {
    const newFilters = {
      ...localFilters,
      [type]: {
        ...localFilters[type],
        [field]: value ? parseInt(value) : undefined
      }
    };
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    dispatch(clearFilters());
  };

  const difficulties = [
    { value: 'easy', label: 'Легко' },
    { value: 'medium', label: 'Средне' },
    { value: 'hard', label: 'Сложно' }
  ];

  const cuisines = [
    'Русская',
    'Итальянская',
    'Азиатская',
    'Французская',
    'Американская',
    'Мексиканская'
  ];

  const sortOptions = [
    { field: 'createdAt', order: 'desc', label: 'Сначала новые' },
    { field: 'createdAt', order: 'asc', label: 'Сначала старые' },
    { field: 'prepTime', order: 'asc', label: 'Быстрые первые' },
    { field: 'prepTime', order: 'desc', label: 'Долгие первые' },
    { field: 'rating', order: 'desc', label: 'Лучшие первые' }
  ];

  return (
    <div className={`${styles.filtersPanel} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Фильтры</h3>
        <button className={styles.closeButton} onClick={onClose}>
          <XMarkIcon className={styles.closeIcon} />
        </button>
      </div>

      <div className={styles.content}>
        {/* Поиск */}
        <div className={styles.section}>
          <label className={styles.label}>Поиск по названию</label>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Введите название рецепта..."
            value={localFilters.search || ''}
            onChange={handleSearchChange}
          />
        </div>

        {/* Сортировка */}
        <div className={styles.section}>
          <label className={styles.label}>Сортировка</label>
          <div className={styles.sortOptions}>
            {sortOptions.map(option => (
              <button
                key={`${option.field}-${option.order}`}
                className={`${styles.sortOption} ${
                  localSort.field === option.field && localSort.order === option.order
                    ? styles.active
                    : ''
                }`}
                onClick={() => handleSortChange(option.field as RecipeSort['field'], option.order as RecipeSort['order'])}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Сложность */}
        <div className={styles.section}>
          <label className={styles.label}>Сложность</label>
          <div className={styles.checkboxGroup}>
            {difficulties.map(difficulty => (
              <label key={difficulty.value} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={localFilters.difficulty?.includes(difficulty.value.toUpperCase() as DifficultyLevel) || false}
                  onChange={() => handleDifficultyChange(difficulty.value)}
                />
                <span className={styles.checkboxLabel}>{difficulty.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Кухня */}
        <div className={styles.section}>
          <label className={styles.label}>Кухня</label>
          <div className={styles.checkboxGroup}>
            {cuisines.map(cuisine => (
              <label key={cuisine} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={localFilters.cuisine?.includes(cuisine.toUpperCase() as KitchenType) || false}
                  onChange={() => handleCuisineChange(cuisine)}
                />
                <span className={styles.checkboxLabel}>{cuisine}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Время приготовления */}
        <div className={styles.section}>
          <label className={styles.label}>Время приготовления (мин)</label>
          <div className={styles.timeRange}>
            <input
              type="number"
              placeholder="От"
              className={styles.timeInput}
              value={localFilters.prepTime?.min || ''}
              onChange={(e) => handleTimeChange('prepTime', e.target.value, 'min')}
            />
            <span className={styles.timeSeparator}>—</span>
            <input
              type="number"
              placeholder="До"
              className={styles.timeInput}
              value={localFilters.prepTime?.max || ''}
              onChange={(e) => handleTimeChange('prepTime', e.target.value, 'max')}
            />
          </div>
        </div>

        {/* Время готовки */}
        <div className={styles.section}>
          <label className={styles.label}>Время готовки (мин)</label>
          <div className={styles.timeRange}>
            <input
              type="number"
              placeholder="От"
              className={styles.timeInput}
              value={localFilters.cookTime?.min || ''}
              onChange={(e) => handleTimeChange('cookTime', e.target.value, 'min')}
            />
            <span className={styles.timeSeparator}>—</span>
            <input
              type="number"
              placeholder="До"
              className={styles.timeInput}
              value={localFilters.cookTime?.max || ''}
              onChange={(e) => handleTimeChange('cookTime', e.target.value, 'max')}
            />
          </div>
        </div>

        {/* Кнопка очистки */}
        <div className={styles.actions}>
          <button className={styles.clearButton} onClick={handleClearFilters}>
            Очистить все
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel; 