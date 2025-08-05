import React, { useState, useEffect } from 'react';
import type { CreateRecipeDto, KitchenType, DifficultyLevel } from '../../types/recipe.types';
import ImageUpload from '../ImageUpload/ImageUpload';
import IngredientPicker from '../IngredientPicker/IngredientPicker';
import StepsEditor from '../StepsEditor/StepsEditor';
import TagsInput from '../TagsInput/TagsInput';
import { PhotoIcon } from '@heroicons/react/24/outline';
import styles from './RecipeForm.module.css';

interface RecipeFormProps {
  initialData: CreateRecipeDto;
  onChange: (data: CreateRecipeDto) => void;
  onSubmit: (data: CreateRecipeDto) => void;
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
  const [formData, setFormData] = useState<CreateRecipeDto>({
    name: initialData.name || '',
    description: initialData.description || '',
    level: initialData.level || 'EASY',
    kitchen: initialData.kitchen || undefined,
    cookTime: initialData.cookTime || 0,
    allTime: initialData.allTime || 0,
    portion: initialData.portion || 1,
    photos: initialData.photos || [],
    tags: initialData.tags || [],
    ingredients: initialData.ingredients || [],
    steps: initialData.steps || []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Синхронизируем локальное состояние с пропсом при изменении initialData
  useEffect(() => {
    setFormData({
      name: initialData.name || '',
      description: initialData.description || '',
      level: initialData.level || 'EASY',
      kitchen: initialData.kitchen || undefined,
      cookTime: initialData.cookTime || 0,
      allTime: initialData.allTime || 0,
      portion: initialData.portion || 1,
      photos: initialData.photos || [],
      tags: initialData.tags || [],
      ingredients: initialData.ingredients || [],
      steps: initialData.steps || []
    });
  }, [initialData]);

  const updateField = <K extends keyof CreateRecipeDto>(
    field: K,
    value: CreateRecipeDto[K]
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название рецепта обязательно';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание рецепта обязательно';
    }
    
    if (formData.allTime <= 0) {
      newErrors.allTime = 'Общее время приготовления должно быть больше 0';
    }
    
    if (formData.cookTime <= 0) {
      newErrors.cookTime = 'Время готовки должно быть больше 0';
    }
    
    if (formData.portion <= 0) {
      newErrors.portion = 'Количество порций должно быть больше 0';
    }
    
    if (!formData.level) {
      newErrors.level = 'Выберите сложность рецепта';
    }
    
    if (formData.ingredients.length === 0) {
      newErrors.ingredients = 'Добавьте хотя бы один ингредиент';
    } else {
      // Проверяем каждый ингредиент
      formData.ingredients.forEach((ing, index) => {
        if (!ing.id) {
          newErrors[`ingredients.${index}.id`] = 'ID ингредиента обязателен';
        }
        if (!ing.count || ing.count <= 0) {
          newErrors[`ingredients.${index}.count`] = 'Количество должно быть больше 0';
        }
        if (!ing.measure) {
          newErrors[`ingredients.${index}.measure`] = 'Единица измерения обязательна';
        }
      });
    }
    
    if (formData.steps.length === 0) {
      newErrors.steps = 'Добавьте хотя бы один шаг приготовления';
    } else {
      // Проверяем каждый шаг
      formData.steps.forEach((step, index) => {
        if (!step.description?.trim()) {
          newErrors[`steps.${index}.description`] = 'Описание шага обязательно';
        }
        if (!step.index || step.index <= 0) {
          newErrors[`steps.${index}.index`] = 'Индекс шага должен быть положительным числом';
        }
      });
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
    { value: 'EASY' as DifficultyLevel, label: 'Легко' },
    { value: 'MEDIUM' as DifficultyLevel, label: 'Средне' },
    { value: 'HARD' as DifficultyLevel, label: 'Сложно' }
  ];

  const kitchenOptions = [
    { value: 'RUSSIAN' as KitchenType, label: 'Русская' },
    { value: 'ASIAN' as KitchenType, label: 'Азиатская' }
  ];

  return (
    <form className={styles.recipeForm} onSubmit={handleSubmit}>
      <div className={styles.formContainer}>
        {/* Основная информация */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Основная информация</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="name">
              Название рецепта *
            </label>
            <input
              id="name"
              type="text"
              className={`${styles.input} ${errors.name ? styles.error : ''}`}
              placeholder="Введите название рецепта"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
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
              <label className={styles.label} htmlFor="allTime">
                Время приготовления (мин) *
              </label>
              <input
                id="allTime"
                type="number"
                min="1"
                className={`${styles.input} ${errors.allTime ? styles.error : ''}`}
                placeholder="15"
                value={Math.floor(formData.allTime / 60) || ''}
                onChange={(e) => updateField('allTime', (parseInt(e.target.value) || 0) * 60)}
              />
              {errors.allTime && <span className={styles.errorText}>{errors.allTime}</span>}
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
                value={Math.floor(formData.cookTime / 60) || ''}
                onChange={(e) => updateField('cookTime', (parseInt(e.target.value) || 0) * 60)}
              />
              {errors.cookTime && <span className={styles.errorText}>{errors.cookTime}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="portion">
                Порций *
              </label>
              <input
                id="portion"
                type="number"
                min="1"
                className={`${styles.input} ${errors.portion ? styles.error : ''}`}
                placeholder="4"
                value={formData.portion || ''}
                onChange={(e) => updateField('portion', parseInt(e.target.value) || 1)}
              />
              {errors.portion && <span className={styles.errorText}>{errors.portion}</span>}
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
                value={formData.level}
                onChange={(e) => updateField('level', e.target.value as DifficultyLevel)}
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
                value={formData.kitchen}
                onChange={(e) => updateField('kitchen', e.target.value as KitchenType)}
              >
                <option value="">Выберите кухню</option>
                {kitchenOptions.map(kitchen => (
                  <option key={kitchen.value} value={kitchen.value}>
                    {kitchen.label}
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
            image={formData.photos?.[0] ? `/api/v1/photo/${formData.photos[0]}` : undefined}
            onImageChange={async (image) => {
              if (image) {
                // TODO: Загрузить файл на сервер и получить photoId
                const photoId = 'temp-' + Date.now();
                updateField('photos', [photoId]);
              } else {
                updateField('photos', []);
              }
            }}
          />
        </section>

        {/* Теги */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Теги</h2>
          <TagsInput
            tags={formData.tags || []}
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
            errors={errors}
          />
          {errors.ingredients && <span className={styles.errorText}>{errors.ingredients}</span>}
        </section>

        {/* Шаги приготовления */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Шаги приготовления *</h2>
          <StepsEditor
            steps={formData.steps}
            onChange={(steps) => updateField('steps', steps)}
            errors={errors}
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