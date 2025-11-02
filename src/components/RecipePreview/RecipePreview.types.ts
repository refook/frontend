import type { Recipe } from '../../types';
import type {
  ApiCreateRecipeDto,
  ApiUpdateRecipeDto,
  ApiUpdateRecipeIngredientDto,
  ApiUpdateStepDto,
  CreateRecipeDto,
  CreateRecipeIngredientDto,
  CreateStepDto,
  RecipeIngredientDto,
  StepResponseDto,
} from '../../types/recipe.types';
import type { ApiIngredient } from '../../types/ingredient.types';

export type FormRecipeData = CreateRecipeDto | ApiCreateRecipeDto | ApiUpdateRecipeDto;

export type NormalizedIngredient = { id: string; name: string; amount: string };

export type RecipeStatsSnapshot = {
  views: number;
  likes: number;
  favorites: number;
  rating: number;
  ratingsCount: number;
};

export type RecipeSocialState = {
  likesCount: number;
  liked: boolean;
  likeLoading: boolean;
  favorite: boolean;
  favoriteLoading: boolean;
  favoritesCount: number;
  rating: number;
  ratingLoading: boolean;
  isAuthenticated: boolean;
  onToggleLike: () => void;
  onToggleFavorite: () => void;
  onSetRating: (value: number) => void;
  recipeId?: string;
};

export type RecipePreviewProps = {
  formData?: FormRecipeData;
  recipe?: Recipe;
  onEdit?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  showActions?: boolean;
  fullHeight?: boolean;
};

export type RecipePreviewHeroProps = {
  title: string;
  description: string;
  imageUrl?: string;
  author: string;
  rating: number;
  views?: number;
  actionsSlot?: React.ReactNode;
};

export type RecipePreviewInfoGridProps = {
  difficultyLabel: string;
  difficultyColor: string;
  totalMinutes: number;
  activeMinutes: number;
  servings: number;
};

export type RecipeMainSectionsProps = {
  title: string;
  servings: number;
  ingredients: NormalizedIngredient[];
  steps: Array<ApiUpdateStepDto | CreateStepDto | StepResponseDto>;
  isFormData: boolean;
  getIngredientName: (id: string) => string | undefined;
  measureLabels: Record<string, string>;
};

export type RecipeReviewSectionProps = {
  rating: number;
  ratingLoading: boolean;
  isAuthenticated: boolean;
  onSetRating: (value: number) => void;
  ratingsCount: number;
};

export type RecipeCommentsSectionProps = {
  recipe?: Recipe;
  title: string;
};

export type RecipeSocialActionsProps = {
  liked: boolean;
  likesCount: number;
  likeLoading: boolean;
  favorite: boolean;
  favoriteLoading: boolean;
  isAuthenticated: boolean;
  onToggleLike: () => void;
  onToggleFavorite: () => void;
  favoritesCount: number;
};

export type RecipePreviewActionsProps = {
  onEdit: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export type RecipePreviewDataSources = {
  isFormData: boolean;
  formRecipeData?: FormRecipeData;
  apiFormData?: ApiCreateRecipeDto | ApiUpdateRecipeDto;
  legacyFormData?: CreateRecipeDto;
  recipeData?: Recipe;
  hasData: boolean;
};

export type AggregatedIngredients = Array<
  ApiUpdateRecipeIngredientDto | CreateRecipeIngredientDto | RecipeIngredientDto | ApiIngredient | unknown
>;
