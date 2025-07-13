import { mockApi } from './mockApi';
import type { Favorite, Recipe } from '../types';

export class FavoritesService {
  // Получение избранных рецептов пользователя
  static async getFavorites(userId: string): Promise<Favorite[]> {
    try {
      return await mockApi.getFavorites(userId);
    } catch (error: any) {
      console.error('Ошибка при получении избранного:', error);
      throw error;
    }
  }

  // Добавление рецепта в избранное
  static async addToFavorites(userId: string, recipeId: string): Promise<Favorite> {
    try {
      return await mockApi.addToFavorites(userId, recipeId);
    } catch (error: any) {
      console.error('Ошибка при добавлении в избранное:', error);
      throw error;
    }
  }

  // Удаление рецепта из избранного
  static async removeFromFavorites(userId: string, recipeId: string): Promise<void> {
    try {
      await mockApi.removeFromFavorites(userId, recipeId);
    } catch (error: any) {
      console.error('Ошибка при удалении из избранного:', error);
      throw error;
    }
  }

  // Проверка, находится ли рецепт в избранном
  static async isInFavorites(userId: string, recipeId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites(userId);
      return favorites.some(favorite => favorite.recipeId === recipeId);
    } catch (error: any) {
      console.error('Ошибка при проверке избранного:', error);
      return false;
    }
  }

  // Переключение состояния избранного (добавить/удалить)
  static async toggleFavorite(userId: string, recipeId: string): Promise<boolean> {
    try {
      const isInFavorites = await this.isInFavorites(userId, recipeId);
      
      if (isInFavorites) {
        await this.removeFromFavorites(userId, recipeId);
        return false;
      } else {
        await this.addToFavorites(userId, recipeId);
        return true;
      }
    } catch (error: any) {
      console.error('Ошибка при переключении избранного:', error);
      throw error;
    }
  }

  // Получение количества избранных рецептов
  static async getFavoritesCount(userId: string): Promise<number> {
    try {
      const favorites = await this.getFavorites(userId);
      return favorites.length;
    } catch (error: any) {
      console.error('Ошибка при получении количества избранного:', error);
      return 0;
    }
  }

  // Получение избранных рецептов с полной информацией о рецептах
  static async getFavoritesWithRecipes(userId: string): Promise<Recipe[]> {
    try {
      const favorites = await this.getFavorites(userId);
      const recipes: Recipe[] = [];
      
      for (const favorite of favorites) {
        if (favorite.recipe) {
          recipes.push(favorite.recipe);
        } else {
          // Если рецепт не загружен, загружаем его
          try {
            const recipe = await mockApi.getRecipe(favorite.recipeId);
            recipes.push(recipe);
          } catch (error) {
            console.warn(`Не удалось загрузить рецепт ${favorite.recipeId}:`, error);
          }
        }
      }
      
      return recipes;
    } catch (error: any) {
      console.error('Ошибка при получении избранных рецептов:', error);
      throw error;
    }
  }
} 