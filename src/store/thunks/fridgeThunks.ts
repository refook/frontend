import { createAsyncThunk } from '@reduxjs/toolkit';
import { FridgeService } from '../../services/fridgeService';
import type { FridgeItem, AddFridgeItemForm } from '../../types';
import {
  fetchFridgeStart,
  fetchFridgeSuccess,
  fetchFridgeFailure,
  addFridgeItem,
  updateFridgeItem,
  removeFridgeItem,
  clearError
} from '../slices/fridgeSlice';

// Получение продуктов в холодильнике
export const fetchFridgeItemsThunk = createAsyncThunk(
  'fridge/fetchFridgeItems',
  async (userId: string, { dispatch }) => {
    try {
      dispatch(fetchFridgeStart());
      
      const items = await FridgeService.getFridgeItems(userId);
      
      dispatch(fetchFridgeSuccess(items));
      
      return items;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке продуктов холодильника';
      dispatch(fetchFridgeFailure(errorMessage));
      throw error;
    }
  }
);

// Добавление продукта в холодильник
export const addFridgeItemThunk = createAsyncThunk(
  'fridge/addFridgeItem',
  async (
    params: { userId: string; formData: AddFridgeItemForm },
    { dispatch }
  ) => {
    try {
      const { userId, formData } = params;
      const newItem = await FridgeService.addFridgeItem(userId, formData);
      
      dispatch(addFridgeItem(newItem));
      
      return newItem;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при добавлении продукта в холодильник';
      dispatch(fetchFridgeFailure(errorMessage));
      throw error;
    }
  }
);

// Обновление продукта в холодильнике
export const updateFridgeItemThunk = createAsyncThunk(
  'fridge/updateFridgeItem',
  async (
    params: { id: string; updates: Partial<FridgeItem> },
    { dispatch }
  ) => {
    try {
      const { id, updates } = params;
      const updatedItem = await FridgeService.updateFridgeItem(id, updates);
      
      dispatch(updateFridgeItem(updatedItem));
      
      return updatedItem;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при обновлении продукта в холодильнике';
      dispatch(fetchFridgeFailure(errorMessage));
      throw error;
    }
  }
);

// Удаление продукта из холодильника
export const deleteFridgeItemThunk = createAsyncThunk(
  'fridge/deleteFridgeItem',
  async (id: string, { dispatch }) => {
    try {
      await FridgeService.deleteFridgeItem(id);
      
      dispatch(removeFridgeItem(id));
      
      return id;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при удалении продукта из холодильника';
      dispatch(fetchFridgeFailure(errorMessage));
      throw error;
    }
  }
);

// Получение продуктов по категории
export const fetchFridgeItemsByCategoryThunk = createAsyncThunk(
  'fridge/fetchFridgeItemsByCategory',
  async (
    params: { userId: string; categoryId: string },
    { dispatch }
  ) => {
    try {
      dispatch(fetchFridgeStart());
      
      const { userId, categoryId } = params;
      const items = await FridgeService.getFridgeItemsByCategory(userId, categoryId);
      
      dispatch(fetchFridgeSuccess(items));
      
      return items;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке продуктов по категории';
      dispatch(fetchFridgeFailure(errorMessage));
      throw error;
    }
  }
);

// Получение продуктов по местоположению
export const fetchFridgeItemsByLocationThunk = createAsyncThunk(
  'fridge/fetchFridgeItemsByLocation',
  async (
    params: { userId: string; location: FridgeItem['location'] },
    { dispatch }
  ) => {
    try {
      dispatch(fetchFridgeStart());
      
      const { userId, location } = params;
      const items = await FridgeService.getFridgeItemsByLocation(userId, location);
      
      dispatch(fetchFridgeSuccess(items));
      
      return items;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке продуктов по местоположению';
      dispatch(fetchFridgeFailure(errorMessage));
      throw error;
    }
  }
);

// Получение продуктов с истекающим сроком годности
export const fetchExpiringItemsThunk = createAsyncThunk(
  'fridge/fetchExpiringItems',
  async (
    params: { userId: string; daysThreshold?: number },
    { dispatch }
  ) => {
    try {
      dispatch(fetchFridgeStart());
      
      const { userId, daysThreshold = 7 } = params;
      const items = await FridgeService.getExpiringItems(userId, daysThreshold);
      
      dispatch(fetchFridgeSuccess(items));
      
      return items;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке продуктов с истекающим сроком';
      dispatch(fetchFridgeFailure(errorMessage));
      throw error;
    }
  }
);

// Получение просроченных продуктов
export const fetchExpiredItemsThunk = createAsyncThunk(
  'fridge/fetchExpiredItems',
  async (userId: string, { dispatch }) => {
    try {
      dispatch(fetchFridgeStart());
      
      const items = await FridgeService.getExpiredItems(userId);
      
      dispatch(fetchFridgeSuccess(items));
      
      return items;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке просроченных продуктов';
      dispatch(fetchFridgeFailure(errorMessage));
      throw error;
    }
  }
);

// Поиск продуктов в холодильнике
export const searchFridgeItemsThunk = createAsyncThunk(
  'fridge/searchFridgeItems',
  async (
    params: { userId: string; query: string },
    { dispatch }
  ) => {
    try {
      dispatch(fetchFridgeStart());
      
      const { userId, query } = params;
      const items = await FridgeService.searchFridgeItems(userId, query);
      
      dispatch(fetchFridgeSuccess(items));
      
      return items;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при поиске продуктов в холодильнике';
      dispatch(fetchFridgeFailure(errorMessage));
      throw error;
    }
  }
);

// Получение статистики холодильника
export const fetchFridgeStatsThunk = createAsyncThunk(
  'fridge/fetchFridgeStats',
  async (userId: string, { dispatch }) => {
    try {
      const stats = await FridgeService.getFridgeStats(userId);
      
      return stats;
    } catch (error: any) {
      console.error('Ошибка при получении статистики холодильника:', error);
      throw error;
    }
  }
);

// Использование ингредиента (уменьшение количества)
export const useIngredientThunk = createAsyncThunk(
  'fridge/useIngredient',
  async (
    params: { userId: string; ingredientId: string; amount: number },
    { dispatch }
  ) => {
    try {
      const { userId, ingredientId, amount } = params;
      await FridgeService.useIngredient(userId, ingredientId, amount);
      
      // Обновляем список продуктов в холодильнике
      const updatedItems = await FridgeService.getFridgeItems(userId);
      dispatch(fetchFridgeSuccess(updatedItems));
      
      return { ingredientId, amount };
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при использовании ингредиента';
      dispatch(fetchFridgeFailure(errorMessage));
      throw error;
    }
  }
);

// Проверка наличия ингредиента
export const checkIngredientAvailabilityThunk = createAsyncThunk(
  'fridge/checkIngredientAvailability',
  async (
    params: { userId: string; ingredientId: string },
    { dispatch }
  ) => {
    try {
      const { userId, ingredientId } = params;
      const hasIngredient = await FridgeService.hasIngredient(userId, ingredientId);
      
      return hasIngredient;
    } catch (error: any) {
      console.error('Ошибка при проверке наличия ингредиента:', error);
      return false;
    }
  }
);

// Получение количества ингредиента
export const getIngredientAmountThunk = createAsyncThunk(
  'fridge/getIngredientAmount',
  async (
    params: { userId: string; ingredientId: string },
    { dispatch }
  ) => {
    try {
      const { userId, ingredientId } = params;
      const amount = await FridgeService.getIngredientAmount(userId, ingredientId);
      
      return amount;
    } catch (error: any) {
      console.error('Ошибка при получении количества ингредиента:', error);
      return 0;
    }
  }
);

// Очистка ошибки холодильника
export const clearFridgeErrorThunk = createAsyncThunk(
  'fridge/clearError',
  async (_, { dispatch }) => {
    dispatch(clearError());
  }
); 