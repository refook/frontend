import React from 'react';
import IngredientsSection from '../../../IngredientsSection/IngredientsSection';
import NutritionInfo from '../../../NutritionInfo/NutritionInfo';
import StepsSection from '../../../StepsSection/StepsSection';
import RecipeTags from '../../../RecipeTags/RecipeTags';
import BadgesChips from '../BadgesChips/BadgesChips';
import type { RecipeMainSectionsProps } from '../../RecipePreview.types';
import styles from './MainSections.module.css';

const MainSections: React.FC<RecipeMainSectionsProps> = ({
  title,
  servings,
  ingredients,
  macros,
  showNutritionDetails,
  onToggleNutrition,
  steps,
  isFormData,
  getIngredientName,
  measureLabels,
  tags,
  categories,
  badges,
}) => (
  <div className={styles.contentGrid}>
    <IngredientsSection
      title={title || 'Рецепт'}
      baseServings={servings}
      ingredients={ingredients}
    />

    <NutritionInfo
      expanded={showNutritionDetails}
      onToggle={onToggleNutrition}
      calories={macros?.calories}
      proteins={macros?.proteins}
      fats={macros?.fats}
      carbs={macros?.carbs}
    />

    <StepsSection
      steps={steps}
      isFormData={isFormData}
      getIngredientName={getIngredientName}
      measureLabels={measureLabels}
    />

    <RecipeTags tags={tags} />
    <RecipeTags tags={categories} title="Категории" />
    <BadgesChips badges={badges} />
  </div>
);

export default MainSections;
