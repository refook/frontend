import { apiService } from './api';
import { mockApi } from './mockApi';
import type { ApiIngredient } from '../types';

// API endpoint for ingredients
const API_BASE_URL = import.meta.env.DEV 
  ? '/api/v1' // Прокси для development
  : import.meta.env.VITE_USE_CORS_PROXY === 'true'
    ? 'https://cors-anywhere.herokuapp.com/http://82.146.39.131:8080/v1' // CORS proxy для production
    : 'http://82.146.39.131:8080/v1'; // Прямой URL (если API поддерживает CORS)

class IngredientsService {
  
  /**
   * Получить все доступные ингредиенты из API
   */
  async getAllIngredients(): Promise<ApiIngredient[]> {
    try {
      console.log(`Загрузка ингредиентов из: ${API_BASE_URL}/ingredient/all`);
      
      // Используем прямой fetch запрос
      const response = await fetch(`${API_BASE_URL}/ingredient/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Добавляем заголовки для CORS proxy
          ...(import.meta.env.PROD && import.meta.env.VITE_USE_CORS_PROXY === 'true' && {
            'X-Requested-With': 'XMLHttpRequest'
          })
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const ingredients: ApiIngredient[] = await response.json();
      console.log(`Успешно загружено ${ingredients.length} ингредиентов`);
      return ingredients;
    } catch (error) {
      console.error('Ошибка при загрузке ингредиентов из API:', error);
      
      // В продакшене используем fallback на mock данные при ошибке API
      if (import.meta.env.PROD) {
        console.log('Fallback: используем mock данные');
        try {
          const mockIngredients = await mockApi.getIngredients();
          // Преобразуем mock данные в формат API
          return mockIngredients.map(ing => ({
            id: ing.id,
            name: ing.name,
            description: ing.description || '',
            measure: 'кг',
            photoId: '',
            ownerUser: {
              id: 1,
              photo: null,
              username: 'mock',
              name: 'Mock User'
            },
            lastUpdater: {
              id: 1,
              photo: null,
              username: 'mock', 
              name: 'Mock User'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
        } catch (mockError) {
          console.error('Ошибка fallback на mock данные:', mockError);
        }
      }
      
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