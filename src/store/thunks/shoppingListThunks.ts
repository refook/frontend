import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ShoppingListFormData } from '../../types';
import * as shoppingListService from '../../services/shoppingListService';
import {
  setLoading,
  setError,
  setShoppingLists,
  addShoppingList,
  updateShoppingList,
  removeShoppingList,
} from '../slices/shoppingListSlice';

// Получить все списки покупок пользователя
export const fetchShoppingListsThunk = createAsyncThunk(
  'shoppingList/fetchShoppingLists',
  async (userId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const lists = shoppingListService.getShoppingLists(userId);
      dispatch(setShoppingLists(lists));
      return lists;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch shopping lists';
      dispatch(setError(message));
      throw error;
    }
  }
);

// Создать новый список покупок
export const createShoppingListThunk = createAsyncThunk(
  'shoppingList/createShoppingList',
  async ({ userId, formData }: { userId: string; formData: ShoppingListFormData }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const newList = shoppingListService.createShoppingList(userId, formData);
      dispatch(addShoppingList(newList));
      return newList;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create shopping list';
      dispatch(setError(message));
      throw error;
    }
  }
);

// Переключить статус элемента списка
export const toggleShoppingListItemThunk = createAsyncThunk(
  'shoppingList/toggleItem',
  async ({ listId, itemId }: { listId: string; itemId: string }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const updatedList = shoppingListService.toggleShoppingListItem(listId, itemId);
      if (updatedList) {
        dispatch(updateShoppingList(updatedList));
        return updatedList;
      } else {
        throw new Error('Failed to update shopping list item');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle shopping list item';
      dispatch(setError(message));
      throw error;
    }
  }
);

// Удалить список покупок
export const deleteShoppingListThunk = createAsyncThunk(
  'shoppingList/deleteShoppingList',
  async (listId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const success = shoppingListService.deleteShoppingList(listId);
      if (success) {
        dispatch(removeShoppingList(listId));
        return listId;
      } else {
        throw new Error('Failed to delete shopping list');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete shopping list';
      dispatch(setError(message));
      throw error;
    }
  }
);

// Очистить все списки покупок пользователя
export const clearShoppingListsThunk = createAsyncThunk(
  'shoppingList/clearShoppingLists',
  async (userId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const success = shoppingListService.clearShoppingLists(userId);
      if (success) {
        dispatch(setShoppingLists([]));
        return true;
      } else {
        throw new Error('Failed to clear shopping lists');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clear shopping lists';
      dispatch(setError(message));
      throw error;
    }
  }
);