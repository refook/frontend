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
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import NutritionInfo from '../NutritionInfo/NutritionInfo';
import IngredientsSection from '../IngredientsSection/IngredientsSection';
import HeroCard from '../HeroCard/HeroCard';
import Chip from '../Chip/Chip';
import StepsSection from '../StepsSection/StepsSection';
import styles from './RecipePreview.module.css';
import InfoCard from '../InfoCard/InfoCard';

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

  // Временные эмодзи для ингредиентов шага (UI-чипов)
  const stepFoodEmojis = ['🍗','🥖','🍅','🥒','🧅','🧀','🫒','🍋','🍚','🥔','🍄','🥚','🌶️','🧄'];
  const getEmoji = (key: string): string => {
    let hash = 0; for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return stepFoodEmojis[hash % stepFoodEmojis.length];
  };

  type NormalizedIngredient = { id: string; name: string; amount: string };
  const normalizeIngredient = (ingredient: CreateRecipeIngredientDto | RecipeIngredientDto): NormalizedIngredient => {
    if (isFormData) {
      const ing = ingredient as CreateRecipeIngredientDto;
      const ai = availableIngredients.find(i => i.id === ing.id);
      const name = ai?.name || 'Ингредиент';
      return { id: `form:${ing.id}:${ing.measure}:${ing.count}`, name, amount: `${ing.count} ${ing.measure.toLowerCase()}` };
    } else {
      const ing = ingredient as RecipeIngredientDto;
      const name = ing.name || 'Ингредиент';
      return { id: `api:${ing.id}`, name, amount: `${ing.count} ${ing.measure.toLowerCase()}` };
    }
  };

  // Локальные состояния для старой реализации ингредиентов больше не используются
  // Оставлены только для совместимости normalizeIngredient → IngredientsSection
  const [showNutritionDetails, setShowNutritionDetails] = useState<boolean>(false);
  const recipeTitle = isFormData ? (data as CreateRecipeDto).name : (data as Recipe).title;

  return (
    <div className={styles.recipePreview}>
      <div className={styles.previewContainer}>
        <HeroCard
          title={title || 'Название рецепта'}
          description={description || 'Описание рецепта'}
          rating={!isFormData && (data as Recipe).stats?.rating ? (data as Recipe).stats!.rating : 4.8}
          author={(isFormData ? 'Автор рецепта' : (data as Recipe).author?.name) || 'Автор'}
        />

        {/* Основная информация */}
        <div className={styles.infoGrid}>
          <InfoCard
            icon={<StarIcon className={styles.infoIcon} />}
            label="Сложность"
            value={
              <span
                className={styles.difficultyBadge}
                style={{
                  color: difficultyColor[difficulty],
                  background: `color-mix(in oklab, ${difficultyColor[difficulty]} 18%, transparent)`
                }}
              >
                {difficultyMap[difficulty]}
              </span>
            }
          />
          <InfoCard
            icon={<ClockIcon className={styles.infoIcon} />}
            label="Общее время"
            value={<span>{totalTime} мин</span>}
          />
          <InfoCard
            icon={<ClockIcon className={styles.infoIcon} />}
            label="Активное время"
            value={<span>{cookTime} мин</span>}
          />
          <InfoCard
            icon={<UserGroupIcon className={styles.infoIcon} />}
            label="Порции"
            value={<span>{servings}</span>}
          />
        </div>

        

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
          <IngredientsSection
            title={title || 'Рецепт'}
            baseServings={Number(servings) || 1}
            ingredients={ingredients.map((ing: any) => normalizeIngredient(ing))}
          />

          {/* Пищевая ценность (заглушка) */}
          <NutritionInfo expanded={showNutritionDetails} onToggle={() => setShowNutritionDetails(v => !v)} />

          {/* Шаги приготовления */}
          <StepsSection
            steps={steps}
            isFormData={isFormData}
            getIngredientName={(id: string) => availableIngredients.find(ai => ai.id === id)?.name}
          />
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