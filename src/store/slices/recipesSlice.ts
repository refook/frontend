import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe, RecipeFilters, RecipeSort } from '../../types';

interface RecipesState {
  items: Recipe[];
  currentRecipe: Recipe | null;
  loading: boolean;
  error: string | null;
  filters: RecipeFilters;
  sort: RecipeSort;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

const initialState: RecipesState = {
  items: [],
  currentRecipe: null,
  loading: false,
  error: null,
  filters: {},
  sort: {
    field: 'createdAt',
    order: 'desc',
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    hasMore: true,
  },
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    fetchRecipesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchRecipesSuccess: (state, action: PayloadAction<{
      recipes: Recipe[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
      };
    }>) => {
      state.loading = false;
      const { recipes, pagination } = action.payload;
      
      if (pagination.page === 1) {
        state.items = recipes;
      } else {
        state.items = [...state.items, ...recipes];
      }
      
      state.pagination = pagination;
    },
    fetchRecipesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchRecipeStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchRecipeSuccess: (state, action: PayloadAction<Recipe>) => {
      state.loading = false;
      state.currentRecipe = action.payload;
    },
    fetchRecipeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<RecipeFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setSort: (state, action: PayloadAction<RecipeSort>) => {
      state.sort = action.payload;
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    updateRecipe: (state, action: PayloadAction<Recipe>) => {
      const index = state.items.findIndex(recipe => recipe.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentRecipe?.id === action.payload.id) {
        state.currentRecipe = action.payload;
      }
    },
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      state.items.unshift(action.payload);
      state.pagination.total += 1;
    },
    removeRecipe: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(recipe => recipe.id !== action.payload);
      state.pagination.total -= 1;
    },
    clearCurrentRecipe: (state) => {
      state.currentRecipe = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchRecipesStart,
  fetchRecipesSuccess,
  fetchRecipesFailure,
  fetchRecipeStart,
  fetchRecipeSuccess,
  fetchRecipeFailure,
  setFilters,
  setSort,
  clearFilters,
  setPage,
  updateRecipe,
  addRecipe,
  removeRecipe,
  clearCurrentRecipe,
  clearError,
} = recipesSlice.actions;

export default recipesSlice.reducer; 