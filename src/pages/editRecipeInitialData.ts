import { useMemo } from 'react';
import type { Recipe } from '../types';
import type { CreateRecipeDto } from '../types/recipe.types';
import {
  mapRecipeToInitialData,
  createEmptyRecipeForm,
  type RecipeLike,
} from '../adapters/recipeAdapter';

export { mapRecipeToInitialData, createEmptyRecipeForm };

export const useEditRecipeInitialData = (recipe?: Recipe | null): CreateRecipeDto => {
  return useMemo(() => mapRecipeToInitialData(recipe as RecipeLike | null), [recipe]);
};
