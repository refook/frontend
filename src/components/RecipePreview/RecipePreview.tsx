import React from 'react';
import type { CreateRecipeForm } from '../../types';
import { 
  ClockIcon, 
  UserGroupIcon, 
  StarIcon,
  PencilIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import styles from './RecipePreview.module.css';

interface RecipePreviewProps {
  formData: CreateRecipeForm;
  onEdit: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const RecipePreview: React.FC<RecipePreviewProps> = ({
  formData,
  onEdit,
  onSubmit,
  isSubmitting
}) => {
  const totalTime = formData.prepTime + formData.cookTime;
  
  const difficultyMap = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно'
  };

  const difficultyColor = {
    easy: 'var(--color-success)',
    medium: 'var(--color-warning)',
    hard: 'var(--color-danger)'
  };

  return (
    <div className={styles.recipePreview}>
      <div className={styles.previewContainer}>
        {/* Заголовок */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {formData.title || 'Название рецепта'}
          </h1>
          <p className={styles.description}>
            {formData.description || 'Описание рецепта'}
          </p>
        </div>

        {/* Основная информация */}
        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <ClockIcon className={styles.metaIcon} />
            <span className={styles.metaText}>
              {formData.prepTime + formData.cookTime} мин
            </span>
          </div>
          
          <div className={styles.metaItem}>
            <UserGroupIcon className={styles.metaIcon} />
            <span className={styles.metaText}>
              {formData.servings} порций
            </span>
          </div>
          
          <div className={styles.metaItem}>
            <StarIcon 
              className={styles.metaIcon} 
              style={{ color: difficultyColor[formData.difficulty] }}
            />
            <span className={styles.metaText}>
              {difficultyMap[formData.difficulty]}
            </span>
          </div>
          
          {formData.cuisine && (
            <div className={styles.metaItem}>
              <span className={styles.cuisine}>
                {formData.cuisine}
              </span>
            </div>
          )}
        </div>

        {/* Изображение */}
        {formData.image && (
          <div className={styles.imageContainer}>
            <img 
              src={URL.createObjectURL(formData.image)} 
              alt={formData.title}
              className={styles.image}
            />
          </div>
        )}

        {/* Теги */}
        {formData.tags.length > 0 && (
          <div className={styles.tagsSection}>
            <h3 className={styles.sectionTitle}>Теги</h3>
            <div className={styles.tags}>
              {formData.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={styles.contentGrid}>
          {/* Ингредиенты */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Ингредиенты ({formData.ingredients.length})
            </h3>
            {formData.ingredients.length > 0 ? (
              <ul className={styles.ingredientsList}>
                {formData.ingredients.map((ingredient, index) => (
                  <li key={index} className={styles.ingredient}>
                    <span className={styles.ingredientName}>
                      {ingredient.name}
                    </span>
                    {ingredient.amount && (
                      <span className={styles.ingredientAmount}>
                        {ingredient.amount} {ingredient.unit}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>
                Добавьте ингредиенты для отображения
              </p>
            )}
          </div>

          {/* Шаги приготовления */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Приготовление ({formData.steps.length} шагов)
            </h3>
            {formData.steps.length > 0 ? (
              <div className={styles.steps}>
                {formData.steps.map((step, index) => (
                  <div key={index} className={styles.step}>
                    <div className={styles.stepNumber}>
                      {index + 1}
                    </div>
                    <div className={styles.stepContent}>
                      <p className={styles.stepDescription}>
                        {step.description || 'Описание шага'}
                      </p>
                      {step.image && (
                        <div className={styles.stepImage}>
                          <img 
                            src={URL.createObjectURL(step.image)} 
                            alt={`Шаг ${index + 1}`}
                            className={styles.stepImg}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>
                Добавьте шаги приготовления
              </p>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className={styles.additionalInfo}>
          <div className={styles.timing}>
            <h4 className={styles.timingTitle}>Время приготовления</h4>
            <div className={styles.timingDetails}>
              <span>Подготовка: {formData.prepTime} мин</span>
              <span>Готовка: {formData.cookTime} мин</span>
              <span>Общее время: {totalTime} мин</span>
            </div>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={onEdit}
          className={styles.editButton}
          disabled={isSubmitting}
        >
          <PencilIcon className={styles.buttonIcon} />
          Продолжить редактирование
        </button>
        
        <button
          type="button"
          onClick={onSubmit}
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className={styles.spinner} />
              Создаем рецепт...
            </>
          ) : (
            <>
              <CheckIcon className={styles.buttonIcon} />
              Создать рецепт
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RecipePreview; 