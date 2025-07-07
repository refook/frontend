import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Favorite } from '../../types';

interface FavoritesState {
  items: Favorite[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  items: [],
  loading: false,
  error: null,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    fetchFavoritesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFavoritesSuccess: (state, action: PayloadAction<Favorite[]>) => {
      state.loading = false;
      state.items = action.payload;
    },
    fetchFavoritesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addToFavorites: (state, action: PayloadAction<Favorite>) => {
      const exists = state.items.find(item => item.recipeId === action.payload.recipeId);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.recipeId !== action.payload);
    },
    toggleFavorite: (state, action: PayloadAction<Favorite>) => {
      const index = state.items.findIndex(item => item.recipeId === action.payload.recipeId);
      if (index !== -1) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
    },
    clearFavorites: (state) => {
      state.items = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchFavoritesStart,
  fetchFavoritesSuccess,
  fetchFavoritesFailure,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  clearFavorites,
  clearError,
} = favoritesSlice.actions;

export default favoritesSlice.reducer; 