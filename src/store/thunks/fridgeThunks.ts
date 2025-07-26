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

// Получение истекающих продуктов
export const fetchExpiringItemsThunk = createAsyncThunk(
  'fridge/fetchExpiringItems',
  async (userId: string, { dispatch }) => {
    try {
      dispatch(fetchFridgeStart());
      
      const items = await FridgeService.getExpiringItems(userId);
      
      dispatch(fetchFridgeSuccess(items));
      
      return items;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при загрузке истекающих продуктов';
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
      const errorMessage = error.message || 'Ошибка при получении статистики холодильника';
      dispatch(fetchFridgeFailure(errorMessage));
      throw error;
    }
  }
);

// Очистка ошибок
export const clearFridgeError = createAsyncThunk(
  'fridge/clearError',
  async (_, { dispatch }) => {
    dispatch(clearError());
  }
); 