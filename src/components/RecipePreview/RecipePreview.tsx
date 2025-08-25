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
import { API_BASE_URL } from '../../services/api';
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
        // Более устойчивый метод: возвращает [] при ошибках (например, 500)
        const ingredients = await ingredientsService.getIngredientsForFridge();
        setAvailableIngredients(ingredients);
      } catch (error) {
        console.error('Ошибка при загрузке ингредиентов:', error);
        setAvailableIngredients([]);
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
  const servings = isFormData ? 1 : (data as Recipe).servings;
  const difficulty = isFormData ? (data as CreateRecipeDto).level.toLowerCase() : (data as Recipe).difficulty;
  const cuisine = isFormData ? undefined : (data as Recipe).cuisine;
  const tags: string[] = isFormData
    ? (((data as CreateRecipeDto).tags ?? []).map((t: any) => (typeof t === 'string' ? t : (t?.name ?? ''))).filter(Boolean))
    : ((data as Recipe).tags || []);
  const ingredients = isFormData ? (data as CreateRecipeDto).ingredients : (data as Recipe).ingredients;
  const steps = isFormData ? (data as CreateRecipeDto).steps : (data as Recipe).steps;
  const photos = isFormData ? (data as CreateRecipeDto).photos : (data as Recipe).photos;
  const heroImageUrl = !isFormData
    ? (() => {
        const raw = (((data as Recipe).photos?.[0]) || (data as Recipe).image);
        if (!raw) return undefined;
        const url = String(raw).trim();
        if (!url) return undefined;
        return /^https?:\/\//i.test(url) ? url : `${API_BASE_URL}/photo/${url}`;
      })()
    : undefined;

  if (!isFormData) {
    // Для отладки отображения изображения
    try { console.debug('RecipePreview heroImageUrl:', heroImageUrl); } catch {}
  }
  
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

  // Эмодзи для шагов теперь берутся в дочернем компоненте через utils/emoji

  type NormalizedIngredient = { id: string; name: string; amount: string };
  const normalizeIngredient = (ingredient: CreateRecipeIngredientDto | RecipeIngredientDto): NormalizedIngredient => {
    if (isFormData) {
      const ing = ingredient as CreateRecipeIngredientDto;
      const ai = availableIngredients.find(i => i.id === ing.id);
      const name = ai?.name || 'Ингредиент';
      const unit = (ing as any).productUnit || (ing as any).measure || '';
      return { id: `form:${ing.id}:${unit}:${ing.count}`, name, amount: `${ing.count} ${String(unit).toLowerCase()}` };
    } else {
      const ing = ingredient as RecipeIngredientDto;
      const name = ing.name || 'Ингредиент';
      const unit = (ing as any).productUnit || (ing as any).measure || '';
      return { id: `api:${ing.id}`, name, amount: `${ing.count} ${String(unit).toLowerCase()}` };
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
          imageUrl={heroImageUrl}
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