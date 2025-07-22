import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ShoppingList } from '../../types';

interface ShoppingListState {
  lists: ShoppingList[];
  loading: boolean;
  error: string | null;
}

const initialState: ShoppingListState = {
  lists: [],
  loading: false,
  error: null,
};

const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setShoppingLists: (state, action: PayloadAction<ShoppingList[]>) => {
      state.lists = action.payload;
      state.loading = false;
      state.error = null;
    },
    addShoppingList: (state, action: PayloadAction<ShoppingList>) => {
      state.lists.unshift(action.payload); // Добавляем в начало для показа новых списков сверху
      state.loading = false;
      state.error = null;
    },
    updateShoppingList: (state, action: PayloadAction<ShoppingList>) => {
      const index = state.lists.findIndex(list => list.id === action.payload.id);
      if (index !== -1) {
        state.lists[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    removeShoppingList: (state, action: PayloadAction<string>) => {
      state.lists = state.lists.filter(list => list.id !== action.payload);
      state.loading = false;
      state.error = null;
    },
    clearShoppingLists: (state) => {
      state.lists = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setShoppingLists,
  addShoppingList,
  updateShoppingList,
  removeShoppingList,
  clearShoppingLists,
} = shoppingListSlice.actions;

export default shoppingListSlice.reducer;