import { mockApi } from './mockApi';
import type { FridgeItem, Ingredient, AddFridgeItemForm } from '../types';

export class FridgeService {
  // Получение продуктов в холодильнике
  static async getFridgeItems(userId: string): Promise<FridgeItem[]> {
    try {
      return await mockApi.getFridgeItems(userId);
    } catch (error: any) {
      console.error('Ошибка при получении продуктов холодильника:', error);
      throw error;
    }
  }

  // Добавление продукта в холодильник
  static async addFridgeItem(userId: string, formData: AddFridgeItemForm): Promise<FridgeItem> {
    try {
      // Получаем информацию об ингредиенте
      const ingredients = await mockApi.getIngredients();
      const ingredient = ingredients.find(ing => ing.id === formData.ingredientId);
      
      if (!ingredient) {
        throw new Error('Ингредиент не найден');
      }

      const newItem: Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        ingredient,
        amount: formData.amount,
        unit: formData.unit,
        expirationDate: formData.expirationDate,
        purchaseDate: formData.purchaseDate,
        location: formData.location,
        notes: formData.notes
      };

      return await mockApi.addFridgeItem(newItem);
    } catch (error: any) {
      console.error('Ошибка при добавлении продукта в холодильник:', error);
      throw error;
    }
  }

  // Обновление продукта в холодильнике
  static async updateFridgeItem(id: string, updates: Partial<FridgeItem>): Promise<FridgeItem> {
    try {
      return await mockApi.updateFridgeItem(id, updates);
    } catch (error: any) {
      console.error('Ошибка при обновлении продукта в холодильнике:', error);
      throw error;
    }
  }

  // Удаление продукта из холодильника
  static async deleteFridgeItem(id: string): Promise<void> {
    try {
      await mockApi.deleteFridgeItem(id);
    } catch (error: any) {
      console.error('Ошибка при удалении продукта из холодильника:', error);
      throw error;
    }
  }

  // Получение продуктов по категории
  static async getFridgeItemsByCategory(userId: string, categoryId: string): Promise<FridgeItem[]> {
    try {
      const items = await this.getFridgeItems(userId);
      return items.filter(item => item.ingredient.category.id === categoryId);
    } catch (error: any) {
      console.error('Ошибка при получении продуктов по категории:', error);
      throw error;
    }
  }

  // Получение продуктов по местоположению
  static async getFridgeItemsByLocation(userId: string, location: FridgeItem['location']): Promise<FridgeItem[]> {
    try {
      const items = await this.getFridgeItems(userId);
      return items.filter(item => item.location === location);
    } catch (error: any) {
      console.error('Ошибка при получении продуктов по местоположению:', error);
      throw error;
    }
  }

  // Получение продуктов с истекающим сроком годности
  static async getExpiringItems(userId: string, daysThreshold: number = 7): Promise<FridgeItem[]> {
    try {
      const items = await this.getFridgeItems(userId);
      const now = new Date();
      const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

      return items.filter(item => {
        if (!item.expirationDate) return false;
        const expirationDate = new Date(item.expirationDate);
        return expirationDate <= thresholdDate && expirationDate >= now;
      });
    } catch (error: any) {
      console.error('Ошибка при получении продуктов с истекающим сроком:', error);
      throw error;
    }
  }

  // Получение просроченных продуктов
  static async getExpiredItems(userId: string): Promise<FridgeItem[]> {
    try {
      const items = await this.getFridgeItems(userId);
      const now = new Date();

      return items.filter(item => {
        if (!item.expirationDate) return false;
        const expirationDate = new Date(item.expirationDate);
        return expirationDate < now;
      });
    } catch (error: any) {
      console.error('Ошибка при получении просроченных продуктов:', error);
      throw error;
    }
  }

  // Поиск продуктов в холодильнике
  static async searchFridgeItems(userId: string, query: string): Promise<FridgeItem[]> {
    try {
      const items = await this.getFridgeItems(userId);
      const searchLower = query.toLowerCase();

      return items.filter(item => 
        item.ingredient.name.toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower)
      );
    } catch (error: any) {
      console.error('Ошибка при поиске продуктов в холодильнике:', error);
      throw error;
    }
  }

  // Получение статистики холодильника
  static async getFridgeStats(userId: string): Promise<{
    totalItems: number;
    categories: { [key: string]: number };
    locations: { [key: string]: number };
    expiringSoon: number;
    expired: number;
  }> {
    try {
      const items = await this.getFridgeItems(userId);
      const expiringSoon = (await this.getExpiringItems(userId)).length;
      const expired = (await this.getExpiredItems(userId)).length;

      const categories: { [key: string]: number } = {};
      const locations: { [key: string]: number } = {};

      items.forEach(item => {
        const categoryName = item.ingredient.category.name;
        categories[categoryName] = (categories[categoryName] || 0) + 1;

        if (item.location) {
          const locationName = this.getLocationName(item.location);
          locations[locationName] = (locations[locationName] || 0) + 1;
        }
      });

      return {
        totalItems: items.length,
        categories,
        locations,
        expiringSoon,
        expired
      };
    } catch (error: any) {
      console.error('Ошибка при получении статистики холодильника:', error);
      throw error;
    }
  }

  // Проверка наличия ингредиента в холодильнике
  static async hasIngredient(userId: string, ingredientId: string): Promise<boolean> {
    try {
      const items = await this.getFridgeItems(userId);
      return items.some(item => item.ingredient.id === ingredientId);
    } catch (error: any) {
      console.error('Ошибка при проверке наличия ингредиента:', error);
      return false;
    }
  }

  // Получение количества ингредиента в холодильнике
  static async getIngredientAmount(userId: string, ingredientId: string): Promise<number> {
    try {
      const items = await this.getFridgeItems(userId);
      const item = items.find(item => item.ingredient.id === ingredientId);
      return item ? item.amount : 0;
    } catch (error: any) {
      console.error('Ошибка при получении количества ингредиента:', error);
      return 0;
    }
  }

  // Уменьшение количества продукта (например, при использовании в рецепте)
  static async useIngredient(userId: string, ingredientId: string, amount: number): Promise<void> {
    try {
      const items = await this.getFridgeItems(userId);
      const item = items.find(item => item.ingredient.id === ingredientId);

      if (!item) {
        throw new Error('Ингредиент не найден в холодильнике');
      }

      if (item.amount < amount) {
        throw new Error('Недостаточно ингредиента в холодильнике');
      }

      const newAmount = item.amount - amount;

      if (newAmount <= 0) {
        // Удаляем продукт, если количество стало 0 или меньше
        await this.deleteFridgeItem(item.id);
      } else {
        // Обновляем количество
        await this.updateFridgeItem(item.id, { amount: newAmount });
      }
    } catch (error: any) {
      console.error('Ошибка при использовании ингредиента:', error);
      throw error;
    }
  }

  // Вспомогательные методы
  private static getLocationName(location: FridgeItem['location']): string {
    const locationMap = {
      fridge: 'Холодильник',
      freezer: 'Морозилка',
      pantry: 'Кладовая'
    };
    
    return locationMap[location!] || 'Неизвестно';
  }

  // Форматирование даты истечения срока годности
  static formatExpirationDate(expirationDate: string): string {
    const date = new Date(expirationDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Просрочен ${Math.abs(diffDays)} дн. назад`;
    } else if (diffDays === 0) {
      return 'Истекает сегодня';
    } else if (diffDays === 1) {
      return 'Истекает завтра';
    } else if (diffDays <= 7) {
      return `Истекает через ${diffDays} дн.`;
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  }

  // Получение цвета для срока годности
  static getExpirationColor(expirationDate: string): string {
    const date = new Date(expirationDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return '#ff6b6b'; // Красный - просрочен
    } else if (diffDays <= 3) {
      return '#ff922b'; // Оранжевый - скоро истечет
    } else if (diffDays <= 7) {
      return '#ffd43b'; // Желтый - истекает в течение недели
    } else {
      return '#51cf66'; // Зеленый - еще много времени
    }
  }
} 