import React, { useMemo, useState } from 'react';
import { API_BASE_URL } from '../../services/api';
import {
  difficultyColor,
  difficultyMap,
} from './RecipePreview.utils';
import type { RecipePreviewProps } from './RecipePreview.types';
import { useRecipePreviewData } from './hooks/useRecipePreviewData';
import { useRecipeSocialState } from './hooks/useRecipeSocialState';
import HeroSection from './components/HeroSection/HeroSection';
import InfoGrid from './components/InfoGrid/InfoGrid';
import MainSections from './components/MainSections/MainSections';
import SocialActions from './components/SocialActions/SocialActions';
import ReviewSection from './components/ReviewSection/ReviewSection';
import CommentsSection from './components/CommentsSection/CommentsSection';
import PreviewActions from './components/PreviewActions/PreviewActions';
import styles from './RecipePreview.module.css';

/**
 * Основной компонент превью рецепта. Служит как модальный обзор перед публикацией
 * или просмотр готового рецепта: собирает данные, отдаёт их подкомпонентам,
 * отображает бейджи, шаги, социальные действия и итоговые кнопки.
 * @note Все вычисления и запросы делегированы хукам `useRecipePreviewData` и
 * `useRecipeSocialState`, сам компонент отвечает только за композицию UI.
 */
const RecipePreview: React.FC<RecipePreviewProps> = ({
  formData,
  recipe,
  onEdit,
  onSubmit,
  isSubmitting = false,
  showActions = true,
}) => {
  const [showNutritionDetails, setShowNutritionDetails] = useState(false);

  const {
    sources,
    steps,
    normalizedIngredients,
    measureLabels,
    getIngredientName,
    tags,
    categories,
    recipeStats,
    badges,
    macros,
  } = useRecipePreviewData(formData, recipe);

  const { isFormData, apiFormData, legacyFormData, recipeData, formRecipeData, hasData } = sources;

  const socialState = useRecipeSocialState({ recipeData, isFormData, stats: recipeStats });

  const title = useMemo(() => {
    if (isFormData) {
      return formRecipeData?.name ?? 'Название рецепта';
    }
    return recipeData?.title || 'Название рецепта';
  }, [formRecipeData?.name, isFormData, recipeData?.title]);

  const description = useMemo(() => {
    if (isFormData) {
      if (apiFormData) return apiFormData.description ?? '';
      return legacyFormData?.description ?? '';
    }
    return recipeData?.description || 'Описание рецепта';
  }, [apiFormData, isFormData, legacyFormData?.description, recipeData?.description]);

  const activeMinutes = useMemo(() => {
    if (apiFormData) {
      const activeSec = Number(apiFormData.cookingTime?.activeTime ?? 0);
      return Math.max(0, Math.round(activeSec / 60));
    }
    if (legacyFormData) {
      const activeSec = Number(legacyFormData.cookTime ?? 0);
      return Math.max(0, Math.round(activeSec / 60));
    }
    return Math.max(0, Number(recipeData?.cookTime ?? 0));
  }, [apiFormData, legacyFormData, recipeData?.cookTime]);

  const totalMinutes = useMemo(() => {
    if (apiFormData) {
      const activeSec = Number(apiFormData.cookingTime?.activeTime ?? 0);
      const allSec = Number(apiFormData.cookingTime?.allTime ?? activeSec);
      return Math.max(0, Math.round(allSec / 60));
    }
    if (legacyFormData) {
      const activeSec = Number(legacyFormData.cookTime ?? 0);
      const allSec = Number(legacyFormData.allTime ?? activeSec);
      return Math.max(0, Math.round(allSec / 60));
    }
    const prep = Number(recipeData?.prepTime ?? 0);
    const cook = Number(recipeData?.cookTime ?? 0);
    return Math.max(0, Math.round(prep + cook));
  }, [apiFormData, legacyFormData, recipeData?.cookTime, recipeData?.prepTime]);

  const servings = useMemo(() => {
    if (apiFormData) return Number(apiFormData.serving?.unitCount ?? 1) || 1;
    if (legacyFormData) return Number((legacyFormData as any).unitCount ?? 1) || 1;
    return recipeData?.servings ?? 1;
  }, [apiFormData, legacyFormData, recipeData?.servings]);

  const difficulty = useMemo(() => {
    if (apiFormData) return apiFormData.level?.toLowerCase?.() ?? 'easy';
    if (legacyFormData) return legacyFormData.level?.toLowerCase?.() ?? 'easy';
    return recipeData?.difficulty ?? 'easy';
  }, [apiFormData, legacyFormData, recipeData?.difficulty]);

  const normalizedDifficulty = difficultyMap[difficulty] ? difficulty : 'easy';

  const heroImageUrl = useMemo(() => {
    if (isFormData) return undefined;
    const raw = recipeData?.photos?.[0] || recipeData?.image;
    if (!raw) return undefined;
    const trimmed = String(raw).trim();
    if (!trimmed) return undefined;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `${API_BASE_URL}/photo/${trimmed}`;
  }, [isFormData, recipeData]);

  const heroActions = !isFormData ? (
    <SocialActions
      liked={socialState.liked}
      likesCount={socialState.likesCount}
      likeLoading={socialState.likeLoading}
      favorite={socialState.favorite}
      favoriteLoading={socialState.favoriteLoading}
      isAuthenticated={socialState.isAuthenticated}
      onToggleLike={socialState.onToggleLike}
      onToggleFavorite={socialState.onToggleFavorite}
      favoritesCount={socialState.favoritesCount}
    />
  ) : undefined;

  const heroRating = !isFormData ? recipeStats.rating : 4.8;

  if (!hasData) {
    return null;
  }

  return (
    <div className={styles.recipePreview}>
      <div className={styles.previewContainer}>
        <HeroSection
          title={title || 'Название рецепта'}
          description={description || 'Описание рецепта'}
          imageUrl={heroImageUrl}
          author={(!isFormData ? recipeData?.author?.name : 'Автор рецепта') || 'Автор'}
          rating={heroRating}
          views={!isFormData ? recipeStats.views : undefined}
          actionsSlot={heroActions}
        />

        <InfoGrid
          difficultyLabel={difficultyMap[normalizedDifficulty]}
          difficultyColor={difficultyColor[normalizedDifficulty]}
          totalMinutes={totalMinutes}
          activeMinutes={activeMinutes}
          servings={servings}
        />

        <MainSections
          title={title}
          servings={Number(servings) || 1}
          ingredients={normalizedIngredients}
          macros={macros}
          showNutritionDetails={showNutritionDetails}
          onToggleNutrition={() => setShowNutritionDetails((prev) => !prev)}
          steps={steps}
          isFormData={isFormData}
          getIngredientName={getIngredientName}
          measureLabels={measureLabels}
          tags={tags}
          categories={categories}
          badges={badges}
        />

        {!isFormData && (
          <ReviewSection
            rating={socialState.rating}
            ratingLoading={socialState.ratingLoading}
            isAuthenticated={socialState.isAuthenticated}
            onSetRating={socialState.onSetRating}
            ratingsCount={recipeStats.ratingsCount}
          />
        )}

        {!isFormData && <CommentsSection recipe={recipeData} title={title} />}
      </div>

      {showActions && onEdit && onSubmit && (
        <PreviewActions isSubmitting={isSubmitting} onEdit={onEdit} onSubmit={onSubmit} />
      )}
    </div>
  );
};

export default RecipePreview;
