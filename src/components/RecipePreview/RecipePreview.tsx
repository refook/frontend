import React from 'react';
import type { CreateRecipeForm, Recipe } from '../../types';
import { 
  ClockIcon, 
  UserGroupIcon, 
  StarIcon,
  PencilIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import styles from './RecipePreview.module.css';

interface RecipePreviewProps {
  formData?: CreateRecipeForm;
  recipe?: Recipe;
  onEdit?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  showActions?: boolean;
}

const RecipePreview: React.FC<RecipePreviewProps> = ({
  formData,
  recipe,
  onEdit,
  onSubmit,
  isSubmitting = false,
  showActions = true
}) => {
  // Используем данные из recipe или formData
  const data = recipe || formData;
  if (!data) return null;

  const isFormData = !recipe;
  
  const title = isFormData ? (data as CreateRecipeForm).title : (data as Recipe).title;
  const description = isFormData ? (data as CreateRecipeForm).description : (data as Recipe).description;
  const prepTime = isFormData ? (data as CreateRecipeForm).prepTime : (data as Recipe).prepTime || 0;
  const cookTime = isFormData ? (data as CreateRecipeForm).cookTime : (data as Recipe).cookTime || 0;
  const servings = isFormData ? (data as CreateRecipeForm).servings : (data as Recipe).servings;
  const difficulty = isFormData ? (data as CreateRecipeForm).difficulty : (data as Recipe).difficulty;
  const cuisine = isFormData ? (data as CreateRecipeForm).cuisine : (data as Recipe).cuisine;
  const tags = isFormData ? (data as CreateRecipeForm).tags : (data as Recipe).tags || [];
  const ingredients = isFormData ? (data as CreateRecipeForm).ingredients : (data as Recipe).ingredients;
  const steps = isFormData ? (data as CreateRecipeForm).steps : (data as Recipe).steps;
  const image = isFormData ? (data as CreateRecipeForm).image : (data as Recipe).image;
  
  const totalTime = prepTime + cookTime;
  
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
            {title || 'Название рецепта'}
          </h1>
          <p className={styles.description}>
            {description || 'Описание рецепта'}
          </p>
        </div>

        {/* Основная информация */}
        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <ClockIcon className={styles.metaIcon} />
            <span className={styles.metaText}>
              {totalTime} мин
            </span>
          </div>
          
          <div className={styles.metaItem}>
            <UserGroupIcon className={styles.metaIcon} />
            <span className={styles.metaText}>
              {servings} порций
            </span>
          </div>
          
          <div className={styles.metaItem}>
            <StarIcon 
              className={styles.metaIcon} 
              style={{ color: difficultyColor[difficulty] }}
            />
            <span className={styles.metaText}>
              {difficultyMap[difficulty]}
            </span>
          </div>
          
          {cuisine && (
            <div className={styles.metaItem}>
              <span className={styles.cuisine}>
                {cuisine}
              </span>
            </div>
          )}
        </div>

        {/* Изображение */}
        {image && (
          <div className={styles.imageContainer}>
            <img 
              src={isFormData ? URL.createObjectURL(image as File) : image as string} 
              alt={title}
              className={styles.image}
            />
          </div>
        )}

        {/* Теги */}
        {tags.length > 0 && (
          <div className={styles.tagsSection}>
            <h3 className={styles.sectionTitle}>Теги</h3>
            <div className={styles.tags}>
              {tags.map((tag, index) => (
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
              Ингредиенты ({ingredients.length})
            </h3>
            {ingredients.length > 0 ? (
              <ul className={styles.ingredientsList}>
                {ingredients.map((ingredient, index) => (
                  <li key={index} className={styles.ingredient}>
                    <span className={styles.ingredientName}>
                      {isFormData 
                        ? (ingredient as CreateRecipeForm['ingredients'][0]).name
                        : (ingredient as Recipe['ingredients'][0]).ingredient?.name || 'Ингредиент'
                      }
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
                {isFormData ? 'Добавьте ингредиенты для отображения' : 'Нет ингредиентов'}
              </p>
            )}
          </div>

          {/* Шаги приготовления */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Приготовление ({steps.length} шагов)
            </h3>
            {steps.length > 0 ? (
              <div className={styles.steps}>
                {steps.map((step, index) => (
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
                            src={isFormData ? URL.createObjectURL(step.image as File) : step.image as string} 
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
                {isFormData ? 'Добавьте шаги приготовления' : 'Нет шагов'}
              </p>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className={styles.additionalInfo}>
          <div className={styles.timing}>
            <h4 className={styles.timingTitle}>Время приготовления</h4>
            <div className={styles.timingDetails}>
              <span>Подготовка: {prepTime} мин</span>
              <span>Готовка: {cookTime} мин</span>
              <span>Общее время: {totalTime} мин</span>
            </div>
          </div>
        </div>
      </div>

      {/* Действия */}
      {showActions && onEdit && onSubmit && (
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
      )}
    </div>
  );
};

export default RecipePreview; 