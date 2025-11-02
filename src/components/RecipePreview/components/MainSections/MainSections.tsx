import React from 'react';
import IngredientsSection from '../../../IngredientsSection/IngredientsSection';
import StepsSection from '../../../StepsSection/StepsSection';
import type { RecipeMainSectionsProps } from '../../RecipePreview.types';
import styles from './MainSections.module.css';

/**
 * Основной контент превью: ингредиенты и шаги приготовления.
 * Компонент выступает контейнером, собирающим ключевые блоки рецепта.
 */
const MainSections: React.FC<RecipeMainSectionsProps> = ({
  title,
  servings,
  ingredients,
  steps,
  isFormData,
  getIngredientName,
  measureLabels,
}) => (
  <div className={styles.contentGrid}>
    <IngredientsSection
      title={title || 'Рецепт'}
      baseServings={servings}
      ingredients={ingredients}
    />

    <StepsSection
      steps={steps}
      isFormData={isFormData}
      getIngredientName={getIngredientName}
      measureLabels={measureLabels}
    />
  </div>
);

export default MainSections;
