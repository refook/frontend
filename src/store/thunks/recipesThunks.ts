import { createAsyncThunk } from '@reduxjs/toolkit';
import { RecipesService } from '../../services/recipesService';
import type { 
  Recipe, 
  CreateRecipeForm, 
  RecipeFilters, 
  RecipeSort,
  PaginatedResponse 
} from '../../types';
import {
  fetchRecipesStart,
  fetchRecipesSuccess,
  fetchRecipesFailure,
  fetchRecipeStart,
  fetchRecipeSuccess,
  fetchRecipeFailure,
  addRecipe,
  updateRecipe,
  removeRecipe,
  clearError
} from '../slices/recipesSlice';

// Получение списка рецептов
export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async (
    params: {
      page?: number;
      limit?: number;
      filters?: RecipeFilters;
      sort?: RecipeSort;
    },
    { dispatch }
  ) => {
    try {
      dispatch(fetchRecipesStart());
      
      const { page = 1, limit = 12, filters, sort } = params;
      const response: PaginatedResponse<Recipe> = await RecipesService.getRecipes(page, limit, filters, sort);
      
      // Преобразуем в формат, ожидаемый Redux
      const pagination = {
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.totalPages
      };
      
      dispatch(fetchRecipesSuccess({
        recipes: response.data,
        pagination
      }));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке рецептов';
      dispatch(fetchRecipesFailure(errorMessage));
      throw error;
    }
  }
);

// Получение одного рецепта
export const fetchRecipe = createAsyncThunk(
  'recipes/fetchRecipe',
  async (id: string, { dispatch }) => {
    try {
      dispatch(fetchRecipeStart());
      
      const recipe = await RecipesService.getRecipe(id);
      
      dispatch(fetchRecipeSuccess(recipe));
      
      return recipe;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке рецепта';
      dispatch(fetchRecipeFailure(errorMessage));
      throw error;
    }
  }
);

// Создание рецепта
export const createRecipe = createAsyncThunk(
  'recipes/createRecipe',
  async (formData: CreateRecipeForm, { dispatch }) => {
    try {
      // Валидация формы
      const validation = RecipesService.validateRecipeForm(formData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const recipe = await RecipesService.createRecipe(formData);
      
      dispatch(addRecipe(recipe));
      
      return recipe;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при создании рецепта';
      throw new Error(errorMessage);
    }
  }
);

// Обновление рецепта
export const updateRecipeThunk = createAsyncThunk(
  'recipes/updateRecipe',
  async (
    params: { id: string; updates: Partial<Recipe> },
    { dispatch }
  ) => {
    try {
      const { id, updates } = params;
      const recipe = await RecipesService.updateRecipe(id, updates);
      
      dispatch(updateRecipe(recipe));
      
      return recipe;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при обновлении рецепта';
      throw new Error(errorMessage);
    }
  }
);

// Удаление рецепта
export const deleteRecipe = createAsyncThunk(
  'recipes/deleteRecipe',
  async (id: string, { dispatch }) => {
    try {
      await RecipesService.deleteRecipe(id);
      
      dispatch(removeRecipe(id));
      
      return id;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при удалении рецепта';
      throw new Error(errorMessage);
    }
  }
);

// Поиск рецептов
export const searchRecipes = createAsyncThunk(
  'recipes/searchRecipes',
  async (
    params: { query: string; page?: number; limit?: number },
    { dispatch }
  ) => {
    try {
      dispatch(fetchRecipesStart());
      
      const { query, page = 1, limit = 12 } = params;
      const response = await RecipesService.searchRecipes(query, page, limit);
      
      const pagination = {
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.totalPages
      };
      
      dispatch(fetchRecipesSuccess({
        recipes: response.data,
        pagination
      }));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при поиске рецептов';
      dispatch(fetchRecipesFailure(errorMessage));
      throw error;
    }
  }
);

// Получение рецептов по сложности
export const fetchRecipesByDifficulty = createAsyncThunk(
  'recipes/fetchRecipesByDifficulty',
  async (
    params: { difficulty: Recipe['difficulty']; page?: number; limit?: number },
    { dispatch }
  ) => {
    try {
      dispatch(fetchRecipesStart());
      
      const { difficulty, page = 1, limit = 12 } = params;
      const response = await RecipesService.getRecipesByDifficulty(difficulty, page, limit);
      
      const pagination = {
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.totalPages
      };
      
      dispatch(fetchRecipesSuccess({
        recipes: response.data,
        pagination
      }));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке рецептов';
      dispatch(fetchRecipesFailure(errorMessage));
      throw error;
    }
  }
);

// Получение быстрых рецептов
export const fetchQuickRecipes = createAsyncThunk(
  'recipes/fetchQuickRecipes',
  async (
    params: { page?: number; limit?: number },
    { dispatch }
  ) => {
    try {
      dispatch(fetchRecipesStart());
      
      const { page = 1, limit = 12 } = params;
      const response = await RecipesService.getQuickRecipes(page, limit);
      
      const pagination = {
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.totalPages
      };
      
      dispatch(fetchRecipesSuccess({
        recipes: response.data,
        pagination
      }));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке быстрых рецептов';
      dispatch(fetchRecipesFailure(errorMessage));
      throw error;
    }
  }
);

// Получение популярных рецептов
export const fetchPopularRecipes = createAsyncThunk(
  'recipes/fetchPopularRecipes',
  async (
    params: { page?: number; limit?: number },
    { dispatch }
  ) => {
    try {
      dispatch(fetchRecipesStart());
      
      const { page = 1, limit = 12 } = params;
      const response = await RecipesService.getPopularRecipes(page, limit);
      
      const pagination = {
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.totalPages
      };
      
      dispatch(fetchRecipesSuccess({
        recipes: response.data,
        pagination
      }));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке популярных рецептов';
      dispatch(fetchRecipesFailure(errorMessage));
      throw error;
    }
  }
);

// Получение новых рецептов
export const fetchNewRecipes = createAsyncThunk(
  'recipes/fetchNewRecipes',
  async (
    params: { page?: number; limit?: number },
    { dispatch }
  ) => {
    try {
      dispatch(fetchRecipesStart());
      
      const { page = 1, limit = 12 } = params;
      const response = await RecipesService.getNewRecipes(page, limit);
      
      const pagination = {
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.totalPages
      };
      
      dispatch(fetchRecipesSuccess({
        recipes: response.data,
        pagination
      }));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке новых рецептов';
      dispatch(fetchRecipesFailure(errorMessage));
      throw error;
    }
  }
);

// Очистка ошибки
export const clearRecipeError = createAsyncThunk(
  'recipes/clearError',
  async (_, { dispatch }) => {
    dispatch(clearError());
  }
); 