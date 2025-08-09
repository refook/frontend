import type { Favorite, Recipe } from '../types';

// API endpoint for favorites
const API_BASE_URL = import.meta.env.DEV ? '/api/v1' : 'https://api.refook.ru/v1';

export class FavoritesService {
  
  /**
   * Получение избранных рецептов пользователя
   */
  static async getFavorites(userId: string): Promise<Favorite[]> {
    try {
      console.log(`Загрузка избранного для пользователя: ${userId}`);
      
      // Пока API не поддерживает избранное, возвращаем пустой массив
      // В будущем здесь будет: await fetch(`${API_BASE_URL}/favorites/${userId}`)
      console.log('API избранного пока не реализован, возвращаем пустой список');
      return [];
      
    } catch (error: any) {
      console.error('Ошибка при получении избранного:', error);
      return [];
    }
  }

  /**
   * Добавление рецепта в избранное
   */
  static async addToFavorites(userId: string, recipeId: string): Promise<Favorite> {
    try {
      console.log('Добавление в избранное:', { userId, recipeId });
      
      // Создаем временный объект избранного
      const newFavorite: Favorite = {
        id: `favorite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recipeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Пока API не реализован, просто возвращаем созданный объект
      console.log('API избранного пока не реализован, возвращаем локальный объект');
      
      // В будущем здесь будет реальный API вызов:
      // const response = await fetch(`${API_BASE_URL}/favorites`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, recipeId })
      // });
      
      return newFavorite;
      
    } catch (error: any) {
      console.error('Ошибка при добавлении в избранное:', error);
      throw error;
    }
  }

  /**
   * Удаление рецепта из избранного
   */
  static async removeFromFavorites(userId: string, recipeId: string): Promise<void> {
    try {
      console.log('Удаление из избранного:', { userId, recipeId });
      
      // Пока API не реализован, просто логируем
      console.log('API избранного пока не реализован');
      
      // В будущем здесь будет реальный API вызов:
      // await fetch(`${API_BASE_URL}/favorites/${userId}/${recipeId}`, {
      //   method: 'DELETE'
      // });
      
    } catch (error: any) {
      console.error('Ошибка при удалении из избранного:', error);
      throw error;
    }
  }

  /**
   * Проверка, находится ли рецепт в избранном
   */
  static async isInFavorites(userId: string, recipeId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites(userId);
      return favorites.some(favorite => favorite.recipeId === recipeId);
    } catch (error: any) {
      console.error('Ошибка при проверке избранного:', error);
      return false;
    }
  }

  /**
   * Переключение состояния избранного (добавить/удалить)
   */
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

  /**
   * Получение количества избранных рецептов
   */
  static async getFavoritesCount(userId: string): Promise<number> {
    try {
      const favorites = await this.getFavorites(userId);
      return favorites.length;
    } catch (error: any) {
      console.error('Ошибка при получении количества избранного:', error);
      return 0;
    }
  }

  /**
   * Получение избранных рецептов с полной информацией о рецептах
   */
  static async getFavoritesWithRecipes(userId: string): Promise<Recipe[]> {
    try {
      const favorites = await this.getFavorites(userId);
      
      // Пока нет рецептов в API, возвращаем пустой массив
      console.log('API рецептов пока возвращает пустой список');
      return [];
      
    } catch (error: any) {
      console.error('Ошибка при получении избранных рецептов:', error);
      return [];
    }
  }
} 