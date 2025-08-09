import type { 
  CreateFridgeProductDto, 
  UpdateFridgeProductDto, 
  FridgeProductResponseDto,
  FridgeProduct 
} from '../types/fridge.types';
import { apiLogger } from '../utils/apiLogger';

// Функция для получения авторизационных заголовков
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// API endpoint
const API_BASE_URL = import.meta.env.DEV ? '/api/v1' : 'https://api.refook.ru/v1';

class FridgeApiService {
  
  /**
   * Получить все продукты из холодильника
   */
  async getAllFridgeProducts(): Promise<FridgeProduct[]> {
    try {
      console.log(`Загрузка продуктов холодильника из: ${API_BASE_URL}/fridge`);
      
      const response = await fetch(`${API_BASE_URL}/fridge`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products: FridgeProductResponseDto[] = await response.json();
      console.log(`Успешно загружено ${products.length} продуктов из холодильника`);

      // Трансформируем данные из API в локальный формат
      return products.map(product => this.transformApiProductToLocal(product));
    } catch (error) {
      console.error('Ошибка при загрузке продуктов холодильника:', error);
      return [];
    }
  }

  /**
   * Добавить продукт в холодильник
   */
  async createFridgeProduct(productData: CreateFridgeProductDto): Promise<FridgeProduct> {
    try {
      console.log('Добавление продукта в холодильник:', productData);
      console.log('JSON данные для отправки:', JSON.stringify(productData, null, 2));
      
      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/fridge`;
      
      // Логируем запрос
      apiLogger.logRequest(url, 'POST', headers, productData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        console.error('Request data:', productData);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }
      
      const newProduct: FridgeProductResponseDto = await response.json();
      console.log('Продукт успешно добавлен в холодильник:', newProduct);
      
      return this.transformApiProductToLocal(newProduct);
    } catch (error) {
      console.error('Ошибка при добавлении продукта в холодильник:', error);
      throw new Error(`Не удалось добавить продукт: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Обновить продукт в холодильнике
   */
  async updateFridgeProduct(productId: string, updateData: UpdateFridgeProductDto): Promise<FridgeProduct> {
    try {
      console.log('Обновление продукта в холодильнике:', { productId, updateData });
      
      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/fridge/${productId}`;
      
      // Логируем запрос
      apiLogger.logRequest(url, 'PUT', headers, updateData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedProduct: FridgeProductResponseDto = await response.json();
      console.log('Продукт успешно обновлен:', updatedProduct);
      
      return this.transformApiProductToLocal(updatedProduct);
    } catch (error) {
      console.error('Ошибка при обновлении продукта:', error);
      throw new Error(`Не удалось обновить продукт: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Удалить продукт из холодильника
   */
  async deleteFridgeProduct(productId: string): Promise<void> {
    try {
      console.log('Удаление продукта из холодильника:', productId);
      
      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/fridge/${productId}`;
      
      // Логируем запрос
      apiLogger.logRequest(url, 'DELETE', headers);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Продукт успешно удален из холодильника');
    } catch (error) {
      console.error('Ошибка при удалении продукта:', error);
      throw new Error(`Не удалось удалить продукт: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Преобразовать API продукт в локальный формат
   */
  private transformApiProductToLocal(apiProduct: FridgeProductResponseDto): FridgeProduct {
    return {
      id: apiProduct.id,
      ingredient: {
        id: apiProduct.ingredientId,
        name: apiProduct.name,
        description: undefined // API не возвращает описание в продуктах холодильника
      },
      amount: apiProduct.count,
      unit: apiProduct.measure,
      expiryDate: apiProduct.expiryDate ? new Date(apiProduct.expiryDate) : undefined,
      notes: apiProduct.comment,
      addedAt: new Date(apiProduct.createdAt),
      updatedAt: new Date(apiProduct.updatedAt)
    };
  }

  /**
   * Преобразовать локальные данные в формат для API
   */
  transformLocalProductToApi(localProduct: {
    ingredient: { id: string };
    amount: number;
    unit: string;
    expiryDate?: string;
    notes?: string;
  }): CreateFridgeProductDto {
    return {
      ingredientId: localProduct.ingredient.id,
      count: localProduct.amount,
      measure: localProduct.unit as any, // Приводим к типу MeasureType
      expiryDate: localProduct.expiryDate,
      comment: localProduct.notes
    };
  }
}

// Создаем и экспортируем единственный экземпляр
export const fridgeApiService = new FridgeApiService();
export default fridgeApiService;