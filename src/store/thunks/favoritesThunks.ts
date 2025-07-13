import { createAsyncThunk } from '@reduxjs/toolkit';
import { FavoritesService } from '../../services/favoritesService';
import type { Favorite, Recipe } from '../../types';
import {
  addToFavorites,
  removeFromFavorites,
  fetchFavoritesSuccess,
  fetchFavoritesStart,
  fetchFavoritesFailure,
  clearError
} from '../slices/favoritesSlice';

// Получение избранных рецептов
export const fetchFavoritesThunk = createAsyncThunk(
  'favorites/fetchFavorites',
  async (userId: string, { dispatch }) => {
    try {
      dispatch(fetchFavoritesStart());
      
      const favorites = await FavoritesService.getFavorites(userId);
      
      dispatch(fetchFavoritesSuccess(favorites));
      
      return favorites;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке избранного';
      dispatch(fetchFavoritesFailure(errorMessage));
      throw error;
    }
  }
);

// Получение избранных рецептов с полной информацией
export const fetchFavoritesWithRecipesThunk = createAsyncThunk(
  'favorites/fetchFavoritesWithRecipes',
  async (userId: string, { dispatch }) => {
    try {
      dispatch(fetchFavoritesStart());
      
      const recipes = await FavoritesService.getFavoritesWithRecipes(userId);
      
      // Создаем объекты Favorite с полной информацией о рецептах
      const favorites: Favorite[] = recipes.map(recipe => ({
        id: `favorite-${recipe.id}`,
        userId,
        recipeId: recipe.id,
        recipe,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      dispatch(fetchFavoritesSuccess(favorites));
      
      return favorites;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке избранных рецептов';
      dispatch(fetchFavoritesFailure(errorMessage));
      throw error;
    }
  }
);

// Добавление в избранное
export const addToFavoritesThunk = createAsyncThunk(
  'favorites/addToFavorites',
  async (
    params: { userId: string; recipeId: string },
    { dispatch }
  ) => {
    try {
      const { userId, recipeId } = params;
      const favorite = await FavoritesService.addToFavorites(userId, recipeId);
      
      dispatch(addToFavorites(favorite));
      
      return favorite;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при добавлении в избранное';
      dispatch(fetchFavoritesFailure(errorMessage));
      throw error;
    }
  }
);

// Удаление из избранного
export const removeFromFavoritesThunk = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (
    params: { userId: string; recipeId: string },
    { dispatch }
  ) => {
    try {
      const { userId, recipeId } = params;
      await FavoritesService.removeFromFavorites(userId, recipeId);
      
      dispatch(removeFromFavorites(recipeId));
      
      return recipeId;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при удалении из избранного';
      dispatch(fetchFavoritesFailure(errorMessage));
      throw error;
    }
  }
);

// Переключение избранного
export const toggleFavoriteThunk = createAsyncThunk(
  'favorites/toggleFavorite',
  async (
    params: { userId: string; recipeId: string },
    { dispatch }
  ) => {
    try {
      const { userId, recipeId } = params;
      const isFavorite = await FavoritesService.toggleFavorite(userId, recipeId);
      
      // Обновляем состояние в зависимости от результата
      if (isFavorite) {
        // Если добавили в избранное, нужно получить объект Favorite
        const favorite = await FavoritesService.getFavorites(userId);
        const newFavorite = favorite.find(f => f.recipeId === recipeId);
        if (newFavorite) {
          dispatch(addToFavorites(newFavorite));
        }
      } else {
        // Если удалили из избранного
        dispatch(removeFromFavorites(recipeId));
      }
      
      return isFavorite;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при переключении избранного';
      dispatch(fetchFavoritesFailure(errorMessage));
      throw error;
    }
  }
);

// Проверка, находится ли рецепт в избранном
export const checkFavoriteStatusThunk = createAsyncThunk(
  'favorites/checkFavoriteStatus',
  async (
    params: { userId: string; recipeId: string },
    { dispatch }
  ) => {
    try {
      const { userId, recipeId } = params;
      const isFavorite = await FavoritesService.isInFavorites(userId, recipeId);
      
      return isFavorite;
    } catch (error: any) {
      console.error('Ошибка при проверке статуса избранного:', error);
      return false;
    }
  }
);

// Получение количества избранных рецептов
export const getFavoritesCountThunk = createAsyncThunk(
  'favorites/getFavoritesCount',
  async (userId: string, { dispatch }) => {
    try {
      const count = await FavoritesService.getFavoritesCount(userId);
      
      return count;
    } catch (error: any) {
      console.error('Ошибка при получении количества избранного:', error);
      return 0;
    }
  }
);

// Очистка ошибки избранного
export const clearFavoritesErrorThunk = createAsyncThunk(
  'favorites/clearError',
  async (_, { dispatch }) => {
    dispatch(clearError());
  }
); 