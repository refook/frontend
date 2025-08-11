import React, { useState, useEffect } from 'react';
import { ingredientsService } from '../../services/ingredientsService';
import type { Recipe } from '../../types';
import type { CreateRecipeDto, CreateRecipeIngredientDto, RecipeIngredientDto } from '../../types/recipe.types';
import type { ApiIngredient } from '../../types/ingredient.types';
import { 
  ClockIcon, 
  UserGroupIcon, 
  StarIcon,
  PencilIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import styles from './RecipePreview.module.css';

interface RecipePreviewProps {
  formData?: CreateRecipeDto;
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
  const [availableIngredients, setAvailableIngredients] = useState<ApiIngredient[]>([]);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const ingredients = await ingredientsService.getAllIngredients();
        setAvailableIngredients(ingredients);
      } catch (error) {
        console.error('Ошибка при загрузке ингредиентов:', error);
      }
    };
    loadIngredients();
  }, []);

  const data = recipe || formData;
  if (!data) return null;

  const isFormData = !recipe;
  
  const title = isFormData ? (data as CreateRecipeDto).name : (data as Recipe).title;
  const description = isFormData ? (data as CreateRecipeDto).description : (data as Recipe).description;
  const prepTime = isFormData ? (data as CreateRecipeDto).allTime : (data as Recipe).prepTime || 0;
  const cookTime = isFormData ? (data as CreateRecipeDto).cookTime : (data as Recipe).cookTime || 0;
  const servings = isFormData ? (data as CreateRecipeDto).portion : (data as Recipe).servings;
  const difficulty = isFormData ? (data as CreateRecipeDto).level.toLowerCase() : (data as Recipe).difficulty;
  const cuisine = isFormData ? (data as CreateRecipeDto).kitchen : (data as Recipe).cuisine;
  const tags = isFormData ? (data as CreateRecipeDto).tags : (data as Recipe).tags || [];
  const ingredients = isFormData ? (data as CreateRecipeDto).ingredients : (data as Recipe).ingredients;
  const steps = isFormData ? (data as CreateRecipeDto).steps : (data as Recipe).steps;
  const photos = isFormData ? (data as CreateRecipeDto).photos : (data as Recipe).photos;
  
  const totalTime = prepTime + cookTime;
  
  const difficultyMap: Record<string, string> = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно'
  };

  const difficultyColor: Record<string, string> = {
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
        {photos && photos.length > 0 && (
          <div className={styles.imageContainer}>
            <img 
              src={`/api/v1/photo/${photos[0]}`}
              alt={title}
              className={styles.image}
            />
          </div>
        )}

        {/* Теги */}
        {tags && tags.length > 0 && (
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
                        ? availableIngredients.find(i => i.id === (ingredient as CreateRecipeIngredientDto).id)?.name || 'Ингредиент'
                        : (ingredient as RecipeIngredientDto).name || 'Ингредиент'
                      }
                    </span>
                    <span className={styles.ingredientAmount}>
                      {isFormData 
                        ? `${(ingredient as CreateRecipeIngredientDto).count} ${(ingredient as CreateRecipeIngredientDto).measure.toLowerCase()}`
                        : `${(ingredient as RecipeIngredientDto).count} ${(ingredient as RecipeIngredientDto).measure.toLowerCase()}`
                      }
                    </span>
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
                      {step.name && (
                        <h4 className={styles.stepTitle}>{step.name}</h4>
                      )}
                      <p className={styles.stepDescription}>
                        {step.description || 'Описание шага'}
                      </p>
                      {step.ingredients && step.ingredients.length > 0 && (
                        <div className={styles.stepIngredients}>
                          <h5 className={styles.stepIngredientsTitle}>Ингредиенты шага</h5>
                          <ul className={styles.stepIngredientsList}>
                            {step.ingredients.map((ing, i) => (
                              <li key={i} className={styles.stepIngredient}>
                                <span className={styles.stepIngredientName}>
                                  {isFormData
                                    ? (availableIngredients.find(ai => ai.id === (ing as CreateRecipeIngredientDto).id)?.name || 'Ингредиент')
                                    : (ing as RecipeIngredientDto).name}
                                </span>
                                <span className={styles.stepIngredientAmount}>
                                  {isFormData
                                    ? `${(ing as CreateRecipeIngredientDto).count} ${(ing as CreateRecipeIngredientDto).measure.toLowerCase()}`
                                    : `${(ing as RecipeIngredientDto).count} ${(ing as RecipeIngredientDto).measure.toLowerCase()}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {step.photos && step.photos.length > 0 && (
                        <div className={styles.stepImage}>
                          <img 
                            src={`/api/v1/photo/${step.photos[0]}`}
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