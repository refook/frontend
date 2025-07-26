import type { FridgeItem, AddFridgeItemForm } from '../types';

// API endpoint for fridge
const API_BASE_URL = import.meta.env.DEV ? '/api/v1' : 'http://82.146.39.131:8080/v1';

export class FridgeService {
  
  /**
   * Получить продукты холодильника для пользователя
   */
  static async getFridgeItems(userId: string): Promise<FridgeItem[]> {
    try {
      console.log(`Загрузка продуктов холодильника для пользователя: ${userId}`);
      
      // Пока API не поддерживает холодильник, возвращаем пустой массив
      // В будущем здесь будет: await fetch(`${API_BASE_URL}/fridge/${userId}`)
      console.log('API холодильника пока не реализован, возвращаем пустой список');
      return [];
      
    } catch (error) {
      console.error('Ошибка при загрузке продуктов холодильника:', error);
      // Возвращаем пустой массив вместо ошибки
      return [];
    }
  }

  /**
   * Добавить продукт в холодильник
   */
  static async addFridgeItem(userId: string, formData: AddFridgeItemForm): Promise<FridgeItem> {
    try {
      console.log('Добавление продукта в холодильник:', formData);
      
      // Создаем временный объект продукта
      const newItem: FridgeItem = {
        id: `fridge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        ingredient: {
          id: formData.ingredientId,
          name: 'Неизвестный продукт', // Будет получено из API ингредиентов
          category: {
            id: 'temp',
            name: 'Временная',
            color: '#ccc'
          }
        },
        amount: formData.amount,
        unit: formData.unit,
        expirationDate: formData.expirationDate,
        purchaseDate: formData.purchaseDate,
        location: formData.location,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Пока API не реализован, просто возвращаем созданный объект
      console.log('API холодильника пока не реализован, возвращаем локальный объект');
      
      // В будущем здесь будет реальный API вызов:
      // const response = await fetch(`${API_BASE_URL}/fridge`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, ...formData })
      // });
      
      return newItem;
      
    } catch (error) {
      console.error('Ошибка при добавлении продукта в холодильник:', error);
      throw new Error(`Не удалось добавить продукт: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Обновить продукт в холодильнике
   */
  static async updateFridgeItem(id: string, updates: Partial<FridgeItem>): Promise<FridgeItem> {
    try {
      console.log('Обновление продукта в холодильнике:', { id, updates });
      
      // Пока API не реализован, возвращаем заглушку
      console.log('API холодильника пока не реализован');
      throw new Error('Функция обновления продуктов находится в разработке');
      
    } catch (error) {
      console.error('Ошибка при обновлении продукта:', error);
      throw new Error(`Не удалось обновить продукт: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Удалить продукт из холодильника
   */
  static async deleteFridgeItem(id: string): Promise<void> {
    try {
      console.log('Удаление продукта из холодильника:', id);
      
      // Пока API не реализован, возвращаем заглушку
      console.log('API холодильника пока не реализован');
      throw new Error('Функция удаления продуктов находится в разработке');
      
    } catch (error) {
      console.error('Ошибка при удалении продукта:', error);
      throw new Error(`Не удалось удалить продукт: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Получить продукты с истекающим сроком годности
   */
  static async getExpiringItems(userId: string, days: number = 3): Promise<FridgeItem[]> {
    try {
      const allItems = await this.getFridgeItems(userId);
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + days);
      
      return allItems.filter(item => {
        if (!item.expirationDate) return false;
        const itemExpiry = new Date(item.expirationDate);
        return itemExpiry <= expiringDate;
      });
      
    } catch (error) {
      console.error('Ошибка при получении истекающих продуктов:', error);
      return [];
    }
  }

  /**
   * Получить статистику холодильника
   */
  static async getFridgeStats(userId: string): Promise<{
    total: number;
    byLocation: Record<string, number>;
    expiringSoon: number;
    expired: number;
  }> {
    try {
      const allItems = await this.getFridgeItems(userId);
      const now = new Date();
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 3);
      
      const byLocation = allItems.reduce((acc, item) => {
        const location = item.location || 'fridge';
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const expiringSoon = allItems.filter(item => {
        if (!item.expirationDate) return false;
        const expiry = new Date(item.expirationDate);
        return expiry <= soonDate && expiry > now;
      }).length;
      
      const expired = allItems.filter(item => {
        if (!item.expirationDate) return false;
        const expiry = new Date(item.expirationDate);
        return expiry <= now;
      }).length;
      
      return {
        total: allItems.length,
        byLocation,
        expiringSoon,
        expired
      };
      
    } catch (error) {
      console.error('Ошибка при получении статистики холодильника:', error);
      return { total: 0, byLocation: {}, expiringSoon: 0, expired: 0 };
    }
  }
} 