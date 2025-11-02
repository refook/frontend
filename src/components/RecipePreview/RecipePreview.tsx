import React, { useCallback, useMemo, useState } from 'react';
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
import NutritionInfo from '../NutritionInfo/NutritionInfo';
import BadgesChips from './components/BadgesChips/BadgesChips';
import PreviewActions from './components/PreviewActions/PreviewActions';
import styles from './RecipePreview.module.css';

const formatKitchenLabel = (value: string): string => {
  const normalized = value?.replace(/_/g, ' ').trim();
  if (!normalized) return value;
  return normalized
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
};

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
  fullHeight = false,
}) => {
  const [showNutritionDetails, setShowNutritionDetails] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<{ kitchens: string[]; tags: string[]; categories: string[] }>({
    kitchens: [],
    tags: [],
    categories: [],
  });

  const toggleMetaChip = useCallback((type: 'kitchens' | 'tags' | 'categories', value: string) => {
    setSelectedMeta((prev) => {
      const list = prev[type];
      const exists = list.includes(value);
      const nextList = exists ? list.filter((item) => item !== value) : [...list, value];
      return { ...prev, [type]: nextList };
    });
  }, []);

  const clearMetaSelection = useCallback(() => {
    setSelectedMeta({ kitchens: [], tags: [], categories: [] });
  }, []);

  const hasSelectedMeta = selectedMeta.kitchens.length > 0 || selectedMeta.tags.length > 0 || selectedMeta.categories.length > 0;

  const {
    sources,
    steps,
    normalizedIngredients,
    measureLabels,
    getIngredientName,
    tags,
    categories,
    kitchens,
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
  const hasMeta = kitchens.length > 0 || tags.length > 0 || categories.length > 0 || badges.length > 0;

  const metaSectionContent = hasMeta ? (
    <>
      <h3 className={styles.metaTitle}>Подборки и кухня</h3>
      <div className={styles.metaGroups}>
        {kitchens.length > 0 && (
          <div className={styles.metaGroup}>
            <span className={styles.metaGroupLabel}>Кухня</span>
            <div className={styles.metaChips}>
              {kitchens.map((kitchen, index) => (
                <button
                  key={`${kitchen}-${index}`}
                  type="button"
                  className={`${styles.metaChip} ${styles.metaChipInteractive}`}
                  aria-pressed={selectedMeta.kitchens.includes(kitchen)}
                  data-chip-role="kitchens"
                  onClick={() => toggleMetaChip('kitchens', kitchen)}
                >
                  {formatKitchenLabel(kitchen)}
                </button>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className={styles.metaGroup}>
            <span className={styles.metaGroupLabel}>Теги</span>
            <div className={styles.metaChips}>
              {tags.map((tag, index) => (
                <button
                  key={`${tag}-${index}`}
                  type="button"
                  className={`${styles.metaChip} ${styles.metaChipInteractive}`}
                  aria-pressed={selectedMeta.tags.includes(tag)}
                  data-chip-role="tag"
                  onClick={() => toggleMetaChip('tags', tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div className={styles.metaGroup}>
            <span className={styles.metaGroupLabel}>Категории</span>
            <div className={styles.metaChips}>
              {categories.map((category, index) => (
                <button
                  key={`${category}-${index}`}
                  type="button"
                  className={`${styles.metaChip} ${styles.metaChipInteractive}`}
                  aria-pressed={selectedMeta.categories.includes(category)}
                  data-chip-role="category"
                  onClick={() => toggleMetaChip('categories', category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {badges.length > 0 && (
          <div className={`${styles.metaGroup} ${styles.metaBadgesGroup}`}>
            <span className={styles.metaGroupLabel}>Бейджи</span>
            <BadgesChips badges={badges} title={null} wrapAs="div" className={styles.metaBadges} />
          </div>
        )}

        {(kitchens.length || tags.length || categories.length) > 0 && (
          <div className={styles.metaAssist}>
            <div className={styles.metaAssistHeader}>
              <span className={styles.metaAssistTitle}>
                <span className={styles.metaAssistIcon}>🔍</span>
                Подобрать похожие рецепты
              </span>
              <button
                type="button"
                className={styles.metaAssistReset}
                onClick={clearMetaSelection}
                disabled={!hasSelectedMeta}
              >
                Сбросить
              </button>
            </div>
            <p className={styles.metaAssistHint}>
              Отметьте интересующие чипы — так проще найти рецепты в похожих подборках.
            </p>
            {hasSelectedMeta && (
              <div className={styles.metaAssistActions}>
                <button type="button" className={styles.metaAssistApply}>
                  Подобрать рецепты
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  ) : null;

  if (!hasData) {
    return null;
  }

  return (
    <div className={`${styles.recipePreview} ${fullHeight ? styles.recipePreviewFull : ''}`}>
      <div className={`${styles.previewContainer} ${fullHeight ? styles.previewContainerFull : ''}`}>
        <div className={styles.previewLayout}>
          <div className={styles.heroColumn}>
            <HeroSection
              title={title || 'Название рецепта'}
              description={description || 'Описание рецепта'}
              imageUrl={heroImageUrl}
              author={(!isFormData ? recipeData?.author?.name : 'Автор рецепта') || 'Автор'}
              rating={heroRating}
              views={!isFormData ? recipeStats.views : undefined}
              actionsSlot={heroActions}
            />
          </div>

          <div className={styles.mainColumn}>
            <div className={styles.mobileInfoBlock}>
              <InfoGrid
                difficultyLabel={difficultyMap[normalizedDifficulty]}
                difficultyColor={difficultyColor[normalizedDifficulty]}
                totalMinutes={totalMinutes}
                activeMinutes={activeMinutes}
                servings={servings}
              />
            </div>

            <div className={styles.mobileNutritionBlock}>
              <NutritionInfo
                expanded={showNutritionDetails}
                onToggle={() => setShowNutritionDetails((prev) => !prev)}
                calories={macros?.calories}
                proteins={macros?.proteins}
                fats={macros?.fats}
                carbs={macros?.carbs}
              />
            </div>

            <MainSections
              title={title}
              servings={Number(servings) || 1}
              ingredients={normalizedIngredients}
              steps={steps}
              isFormData={isFormData}
              getIngredientName={getIngredientName}
              measureLabels={measureLabels}
            />

            {metaSectionContent && (
              <section className={`${styles.metaSection} ${styles.metaSectionMobile}`}>
                {metaSectionContent}
              </section>
            )}

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

          <aside className={styles.sideColumn}>
            <div className={styles.infoGridBlock}>
              <InfoGrid
                difficultyLabel={difficultyMap[normalizedDifficulty]}
                difficultyColor={difficultyColor[normalizedDifficulty]}
                totalMinutes={totalMinutes}
                activeMinutes={activeMinutes}
                servings={servings}
              />
            </div>

            <div className={styles.nutritionBlock}>
              <NutritionInfo
                expanded={showNutritionDetails}
                onToggle={() => setShowNutritionDetails((prev) => !prev)}
                calories={macros?.calories}
                proteins={macros?.proteins}
                fats={macros?.fats}
                carbs={macros?.carbs}
              />
            </div>

            {metaSectionContent && (
              <section className={`${styles.metaSection} ${styles.metaSectionDesktop}`}>
                {metaSectionContent}
              </section>
            )}
          </aside>
        </div>
      </div>

      {showActions && onEdit && onSubmit && (
        <PreviewActions isSubmitting={isSubmitting} onEdit={onEdit} onSubmit={onSubmit} />
      )}
    </div>
  );
};

export default RecipePreview;
