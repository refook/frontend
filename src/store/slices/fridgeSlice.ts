import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FridgeItem } from '../../types';

interface FridgeState {
  items: FridgeItem[];
  loading: boolean;
  error: string | null;
}

const initialState: FridgeState = {
  items: [],
  loading: false,
  error: null,
};

const fridgeSlice = createSlice({
  name: 'fridge',
  initialState,
  reducers: {
    fetchFridgeStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFridgeSuccess: (state, action: PayloadAction<FridgeItem[]>) => {
      state.loading = false;
      state.items = action.payload;
    },
    fetchFridgeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addFridgeItem: (state, action: PayloadAction<FridgeItem>) => {
      state.items.push(action.payload);
    },
    updateFridgeItem: (state, action: PayloadAction<FridgeItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeFridgeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearFridge: (state) => {
      state.items = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchFridgeStart,
  fetchFridgeSuccess,
  fetchFridgeFailure,
  addFridgeItem,
  updateFridgeItem,
  removeFridgeItem,
  clearFridge,
  clearError,
} = fridgeSlice.actions;

export default fridgeSlice.reducer; 