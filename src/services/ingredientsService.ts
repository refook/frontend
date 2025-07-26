import { apiService } from './api';
import type { ApiIngredient } from '../types';

// API endpoint for ingredients - используем прокси в development
const API_BASE_URL = import.meta.env.DEV ? '/api/v1' : 'http://82.146.39.131:8080/v1';

class IngredientsService {
  
  /**
   * Получить все доступные ингредиенты из API
   */
  async getAllIngredients(): Promise<ApiIngredient[]> {
    try {
      // Используем прямой fetch запрос через прокси
      const response = await fetch(`${API_BASE_URL}/ingredient/all`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const ingredients: ApiIngredient[] = await response.json();
      return ingredients;
    } catch (error) {
      console.error('Ошибка при загрузке ингредиентов:', error);
      throw new Error('Не удалось загрузить список ингредиентов');
    }
  }

  /**
   * Преобразовать API ингредиент в локальный формат для совместимости
   */
  transformApiIngredientToLocal(apiIngredient: ApiIngredient): {
    id: string;
    name: string;
    description?: string;
    category: {
      id: string;
      name: string;
      color: string;
    };
  } {
    return {
      id: apiIngredient.id,
      name: apiIngredient.name,
      description: apiIngredient.description,
      category: {
        id: 'api-category',
        name: 'Из API',
        color: '#4f46e5'
      }
    };
  }

  /**
   * Получить ингредиенты в локальном формате для использования в компонентах
   */
  async getIngredientsForFridge() {
    const apiIngredients = await this.getAllIngredients();
    return apiIngredients.map(ingredient => this.transformApiIngredientToLocal(ingredient));
  }

  /**
   * Поиск ингредиентов по названию
   */
  async searchIngredients(query: string): Promise<ApiIngredient[]> {
    const allIngredients = await this.getAllIngredients();
    const searchQuery = query.toLowerCase().trim();
    
    if (!searchQuery) {
      return allIngredients;
    }
    
    return allIngredients.filter(ingredient => 
      ingredient.name.toLowerCase().includes(searchQuery) ||
      ingredient.description.toLowerCase().includes(searchQuery)
    );
  }

  /**
   * Получить единицы измерения для конкретного ингредиента
   */
  getUnitsForIngredient(ingredient: ApiIngredient): string[] {
    // Возвращаем стандартную единицу из API и дополнительные варианты
    const baseUnit = ingredient.measure;
    const additionalUnits = ['шт', 'г', 'кг', 'мл', 'л', 'ст.л.', 'ч.л.', 'стакан'];
    
    // Убираем дубликаты и возвращаем
    const units = [baseUnit, ...additionalUnits].filter((unit, index, arr) => 
      arr.indexOf(unit) === index
    );
    
    return units;
  }
}

// Создаем и экспортируем единственный экземпляр
export const ingredientsService = new IngredientsService();
export default ingredientsService; 