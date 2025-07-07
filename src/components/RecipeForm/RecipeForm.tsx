import React, { useState, useEffect } from 'react';
import type { CreateRecipeForm } from '../../types';
import ImageUpload from '../ImageUpload/ImageUpload';
import IngredientPicker from '../IngredientPicker/IngredientPicker';
import StepsEditor from '../StepsEditor/StepsEditor';
import TagsInput from '../TagsInput/TagsInput';
import { PhotoIcon } from '@heroicons/react/24/outline';
import styles from './RecipeForm.module.css';

interface RecipeFormProps {
  initialData: CreateRecipeForm;
  onChange: (data: CreateRecipeForm) => void;
  onSubmit: (data: CreateRecipeForm) => void;
  isSubmitting: boolean;
  isValid: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData,
  onChange,
  onSubmit,
  isSubmitting,
  isValid
}) => {
  const [formData, setFormData] = useState<CreateRecipeForm>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Синхронизируем локальное состояние с пропсом при изменении initialData
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const updateField = <K extends keyof CreateRecipeForm>(
    field: K,
    value: CreateRecipeForm[K]
  ) => {
    // Используем локальное состояние formData как базу
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
    
    // Очищаем ошибку для этого поля
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Название рецепта обязательно';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание рецепта обязательно';
    }
    
    if (formData.prepTime <= 0) {
      newErrors.prepTime = 'Время приготовления должно быть больше 0';
    }
    
    if (formData.cookTime <= 0) {
      newErrors.cookTime = 'Время готовки должно быть больше 0';
    }
    
    if (formData.servings <= 0) {
      newErrors.servings = 'Количество порций должно быть больше 0';
    }
    
    if (formData.ingredients.length === 0) {
      newErrors.ingredients = 'Добавьте хотя бы один ингредиент';
    }
    
    if (formData.steps.length === 0) {
      newErrors.steps = 'Добавьте хотя бы один шаг приготовления';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const difficultyOptions = [
    { value: 'easy', label: 'Легко' },
    { value: 'medium', label: 'Средне' },
    { value: 'hard', label: 'Сложно' }
  ];

  const cuisineOptions = [
    'Русская',
    'Итальянская',
    'Азиатская',
    'Французская',
    'Американская',
    'Мексиканская',
    'Индийская',
    'Греческая'
  ];

  return (
    <form className={styles.recipeForm} onSubmit={handleSubmit}>
      <div className={styles.formContainer}>
        {/* Основная информация */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Основная информация</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="title">
              Название рецепта *
            </label>
            <input
              id="title"
              type="text"
              className={`${styles.input} ${errors.title ? styles.error : ''}`}
              placeholder="Введите название рецепта"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
            {errors.title && <span className={styles.errorText}>{errors.title}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="description">
              Описание *
            </label>
            <textarea
              id="description"
              className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
              placeholder="Расскажите о вашем рецепте"
              rows={4}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
            {errors.description && <span className={styles.errorText}>{errors.description}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="prepTime">
                Время приготовления (мин) *
              </label>
              <input
                id="prepTime"
                type="number"
                min="1"
                className={`${styles.input} ${errors.prepTime ? styles.error : ''}`}
                placeholder="15"
                value={formData.prepTime || ''}
                onChange={(e) => updateField('prepTime', parseInt(e.target.value) || 0)}
              />
              {errors.prepTime && <span className={styles.errorText}>{errors.prepTime}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="cookTime">
                Время готовки (мин) *
              </label>
              <input
                id="cookTime"
                type="number"
                min="1"
                className={`${styles.input} ${errors.cookTime ? styles.error : ''}`}
                placeholder="30"
                value={formData.cookTime || ''}
                onChange={(e) => updateField('cookTime', parseInt(e.target.value) || 0)}
              />
              {errors.cookTime && <span className={styles.errorText}>{errors.cookTime}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="servings">
                Порций *
              </label>
              <input
                id="servings"
                type="number"
                min="1"
                className={`${styles.input} ${errors.servings ? styles.error : ''}`}
                placeholder="4"
                value={formData.servings || ''}
                onChange={(e) => updateField('servings', parseInt(e.target.value) || 1)}
              />
              {errors.servings && <span className={styles.errorText}>{errors.servings}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="difficulty">
                Сложность
              </label>
              <select
                id="difficulty"
                className={styles.select}
                value={formData.difficulty}
                onChange={(e) => updateField('difficulty', e.target.value as any)}
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="cuisine">
                Кухня
              </label>
              <select
                id="cuisine"
                className={styles.select}
                value={formData.cuisine}
                onChange={(e) => updateField('cuisine', e.target.value)}
              >
                <option value="">Выберите кухню</option>
                {cuisineOptions.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Изображение */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <PhotoIcon className={styles.sectionIcon} />
            Фотография
          </h2>
          <ImageUpload
            image={formData.image}
            onImageChange={(image) => updateField('image', image)}
          />
        </section>

        {/* Теги */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Теги</h2>
          <TagsInput
            tags={formData.tags}
            onChange={(tags) => updateField('tags', tags)}
            placeholder="Добавить тег (нажмите Enter)"
          />
        </section>

        {/* Ингредиенты */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ингредиенты *</h2>
          <IngredientPicker
            ingredients={formData.ingredients}
            onChange={(ingredients) => updateField('ingredients', ingredients)}
          />
          {errors.ingredients && <span className={styles.errorText}>{errors.ingredients}</span>}
        </section>

        {/* Шаги приготовления */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Шаги приготовления *</h2>
          <StepsEditor
            steps={formData.steps}
            onChange={(steps) => updateField('steps', steps)}
          />
          {errors.steps && <span className={styles.errorText}>{errors.steps}</span>}
        </section>

        {/* Кнопки */}
        <div className={styles.actions}>
          <button
            type="submit"
            className={`${styles.submitButton} ${!isValid ? styles.disabled : ''}`}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Создаем рецепт...' : 'Создать рецепт'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RecipeForm; 