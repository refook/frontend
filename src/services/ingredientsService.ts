import type { ApiIngredient } from '../types/ingredient.types';
import type { MeasureType } from '../types/measures.types';
import { apiLogger } from '../utils/apiLogger';
import {API_BASE_URL} from "./api.ts";

// Функция для получения авторизационных заголовков
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// API endpoint for ingredients
class IngredientsService {
  
  /**
   * Получить все доступные ингредиенты из API
   */
  async getAllIngredients(): Promise<ApiIngredient[]> {
    try {
      console.log(`Загрузка ингредиентов из: ${API_BASE_URL}/ingredient/all`);
      
      const response = await fetch(`${API_BASE_URL}/ingredient/all`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const ingredients: ApiIngredient[] = await response.json();
      console.log(`Успешно загружено ${ingredients.length} ингредиентов из API`);
      return ingredients;
    } catch (error) {
      console.error('Ошибка при загрузке ингредиентов из API:', error);
      
      // Если ошибка 401 - проблема с авторизацией
      if (error instanceof Error && error.message.includes('401')) {
        console.warn('Ошибка авторизации. Необходим валидный JWT токен для доступа к API');
        console.warn('Попробуйте установить токен: localStorage.setItem("authToken", "your-jwt-token")');
      }
      
      throw new Error(`Не удалось загрузить список ингредиентов: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Получить ингредиент по ID
   */
  async getIngredientById(id: string): Promise<ApiIngredient | null> {
    try {
      const allIngredients = await this.getAllIngredients();
      return allIngredients.find(ing => ing.id === id) || null;
    } catch (error) {
      console.error('Ошибка при получении ингредиента по ID:', error);
      throw error;
    }
  }

  /**
   * Создать новый ингредиент (POST)
   */
  async createIngredient(ingredientData: {
    name: string;
    description: string;
    measure: MeasureType;
  }): Promise<ApiIngredient> {
    try {
      console.log('Создание нового ингредиента:', ingredientData);
      
      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/ingredient`;
      
      // Логируем запрос
      apiLogger.logRequest(url, 'POST', headers, ingredientData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(ingredientData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newIngredient: ApiIngredient = await response.json();
      console.log('Ингредиент успешно создан:', newIngredient);
      return newIngredient;
    } catch (error) {
      console.error('Ошибка при создании ингредиента:', error);
      throw new Error(`Не удалось создать ингредиент: ${error instanceof Error ? error.message : String(error)}`);
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
  async getIngredientsForFridge(): Promise<ApiIngredient[]> {
    try {
      return await this.getAllIngredients();
    } catch (error) {
      console.error('Ошибка при загрузке ингредиентов для холодильника:', error);
      // Возвращаем пустой массив вместо падения приложения
      return [];
    }
  }

  /**
   * Поиск ингредиентов по названию
   */
  async searchIngredients(query: string): Promise<ApiIngredient[]> {
    try {
      const allIngredients = await this.getAllIngredients();
      const searchQuery = query.toLowerCase().trim();
      
      if (!searchQuery) {
        return allIngredients;
      }
      
      return allIngredients.filter(ingredient => 
        ingredient.name.toLowerCase().includes(searchQuery) ||
        ingredient.description.toLowerCase().includes(searchQuery)
      );
    } catch (error) {
      console.error('Ошибка при поиске ингредиентов:', error);
      return [];
    }
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

  /**
   * Получить URL изображения по photoId (если API поддерживает)
   */
  getImageUrl(photoId: string): string | null {
    if (!photoId) return null;
    
    // Предполагаем что есть эндпоинт для получения изображений
    return `${API_BASE_URL}/photo/${photoId}`;
  }

  /**
   * Получить статистику ингредиентов
   */
  async getIngredientsStats(): Promise<{
    total: number;
    byMeasure: Record<string, number>;
  }> {
    try {
      const ingredients = await this.getAllIngredients();
      
      const byMeasure = ingredients.reduce((acc, ing) => {
        acc[ing.measure] = (acc[ing.measure] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        total: ingredients.length,
        byMeasure
      };
    } catch (error) {
      console.error('Ошибка при получении статистики:', error);
      return { total: 0, byMeasure: {} };
    }
  }
}

// Создаем и экспортируем единственный экземпляр
export const ingredientsService = new IngredientsService();
export default ingredientsService; 