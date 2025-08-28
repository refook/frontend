import type { 
  CreateFridgeProductDto, 
  UpdateFridgeProductDto, 
  FridgeProductResponseDto,
  FridgeProduct,
  CreateFridgeDto,
  FridgeResponseDto
} from '../types/fridge.types';
import { apiLogger } from '../utils/apiLogger';
import { getAuthHeaders, authorizedFetch } from './auth';

// Функция для получения авторизационных заголовков
// централизованные заголовки и fetch

// API endpoint
const API_BASE_URL = import.meta.env.DEV ? '/api/v1' : 'https://api.refook.ru/v1';

class FridgeApiService {
  // ---------------- Fridges (контейнеры) ----------------

  /**
   * Получить список холодильников текущего пользователя
   */
  async getUserFridges(): Promise<FridgeResponseDto[]> {
    const url = `${API_BASE_URL}/fridges`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);
    const response = await authorizedFetch(url, { method: 'GET', headers });
    if (!response.ok) {
      throw new Error(`Не удалось загрузить холодильники: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Создать холодильник пользователя
   */
  async createFridge(payload: CreateFridgeDto): Promise<FridgeResponseDto> {
    const url = `${API_BASE_URL}/fridges`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'POST', headers, payload);
    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Не удалось создать холодильник: ${response.status} ${errorText}`);
    }
    return response.json();
  }

  // ---------------- Fridge products ----------------
  
  /**
   * Получить все продукты из конкретного холодильника
   */

  async getAllFridgeProducts(fridgeId?: string): Promise<FridgeProduct[]> {
    try {
      let targetFridgeId = fridgeId;
      if (!targetFridgeId) {
        const fridges = await this.getUserFridges();
        targetFridgeId = fridges[0]?.id;
        if (!targetFridgeId) {
          console.warn('Нет доступных холодильников для загрузки продуктов');
          return [];
        }
      }
      console.log(`Загрузка продуктов холодильника из: ${API_BASE_URL}/fridge/${targetFridgeId}/products`);
      const response = await authorizedFetch(`${API_BASE_URL}/fridge/${targetFridgeId}/products`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const raw = await response.json();
      console.log('Сырой ответ продуктов холодильника:', raw);
      const list: FridgeProductResponseDto[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
            ? raw.items
            : [];
      console.log(`Успешно загружено ${list.length} продуктов из холодильника`);
      return list.map(product => this.transformApiProductToLocal(product));
    } catch (error) {
      console.error('Ошибка при загрузке продуктов холодильника:', error);
      return [];
    }
  }

  /**
   * Добавить продукт в конкретный холодильник
   */
  async createFridgeProduct(fridgeId: string, productData: CreateFridgeProductDto): Promise<FridgeProduct> {
    try {
      console.log('Добавление продукта в холодильник:', productData);
      console.log('JSON данные для отправки:', JSON.stringify(productData, null, 2));
      
      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/fridge/${fridgeId}/products`;
      
      // Логируем запрос
      apiLogger.logRequest(url, 'POST', headers, productData);
      
      const response = await authorizedFetch(url, {
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
  private buildUpdateDto(current: FridgeProduct, updates: Partial<UpdateFridgeProductDto> & { count?: number; comment?: string }): UpdateFridgeProductDto {
    const normalizeProductUnit = (u: string): 'GRAM' | 'KILOGRAM' | 'MILLIGRAM' | any => {
      const U = (u || '').toUpperCase();
      if (U === 'KG' || U === 'KILOGRAM') return 'KILOGRAM';
      if (U === 'MG' || U === 'MILLIGRAM') return 'MILLIGRAM';
      return 'GRAM';
    };
    const inferBaseUnit = (u: string): 'GR' | 'ML' => {
      const U = (u || '').toUpperCase();
      return (U === 'ML' || U === 'L' || U === 'MILLILITER' || U === 'LITER') ? 'ML' : 'GR';
    };
    const toIsoOrNull = (d?: Date): string | null => {
      if (!d) return null;
      // Оставляем как есть в ISO
      return d.toISOString();
    };

    const resolvedProductUnit = ((): 'GRAM' | 'KILOGRAM' | 'MILLIGRAM' => {
      if (updates.productUnit) return updates.productUnit as any;
      return normalizeProductUnit(current.unit) as any;
    })();
    const resolvedBaseUnit = ((): 'GR' | 'ML' => {
      if (updates.baseUnit) return updates.baseUnit as any;
      return inferBaseUnit(current.unit) as any;
    })();

    return {
      productId: current.ingredient.id,
      baseUnit: resolvedBaseUnit as any,
      count: typeof updates.count === 'number' ? updates.count : current.amount,
      productUnit: resolvedProductUnit as any,
      expiryDate: toIsoOrNull(current.expiryDate),
      comment: typeof updates.comment === 'string' ? updates.comment : current.notes
    };
  }

  async updateFridgeProduct(fridgeId: string, fridgeProductId: string, updateData: Partial<UpdateFridgeProductDto> & { count?: number; comment?: string }, current: FridgeProduct): Promise<FridgeProduct> {
    try {
      console.log('Обновление продукта в холодильнике:', { fridgeId, fridgeProductId, updateData });
      
      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/fridge/${fridgeId}/products/${fridgeProductId}`;
      const body = this.buildUpdateDto(current, updateData);
      
      // Логируем запрос
      apiLogger.logRequest(url, 'PUT', headers, body);
      
      const response = await authorizedFetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
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
  async deleteFridgeProduct(fridgeId: string, fridgeProductId: string): Promise<void> {
    try {
      console.log('Удаление продукта из холодильника:', { fridgeId, fridgeProductId });
      
      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/fridge/${fridgeId}/products/${fridgeProductId}`;
      
      // Логируем запрос
      apiLogger.logRequest(url, 'DELETE', headers);
      
      const response = await authorizedFetch(url, {
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
        id: apiProduct.productId,
        name: apiProduct.name,
        description: undefined
      },
      amount: apiProduct.count,
      unit: apiProduct.productUnit,
      baseUnit: apiProduct.baseUnit,
      expiryDate: apiProduct.expiryDate ? new Date(apiProduct.expiryDate) : undefined,
      notes: apiProduct.comment,
      addedAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Преобразовать локальные данные в формат для API
   */
  transformLocalProductToApi(localProduct: {
    ingredient: { id: string };
    amount: number;
    unit: string;
    baseUnit?: 'GR' | 'ML';
    expiryDate?: string;
    notes?: string;
  }): CreateFridgeProductDto {
    const toIsoStartOfDayUtc = (dateStr?: string): string | null => {
      if (!dateStr) return null;
      // Ожидаем формат YYYY-MM-DD из инпута и конвертируем в ISO в UTC полночь
      const [year, month, day] = dateStr.split('-').map(n => parseInt(n, 10));
      if (!year || !month || !day) return null;
      const iso = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).toISOString();
      return iso;
    };

    // Определяем baseUnit по выбранной единице
    const unit = (localProduct.unit || '').toUpperCase();
    const baseUnit = (localProduct.baseUnit as any) || (unit === 'ML' || unit === 'L' || unit === 'MILLILITER' || unit === 'LITER' ? 'ML' : 'GR');

    // productUnit ограничиваем до: GRAM, KILOGRAM, MILLIGRAM
    const productUnit = (() => {
      const u = unit;
      if (u === 'KG' || u === 'KILOGRAM') return 'KILOGRAM';
      if (u === 'MG' || u === 'MILLIGRAM') return 'MILLIGRAM';
      // По умолчанию отправляем в граммах
      return 'GRAM';
    })();

    // avgWeight пока задаём эвристически: количество, если есть; иначе 1
    const avgWeight = Number.isFinite(localProduct.amount) ? Number(localProduct.amount) : 1;

    return {
      productId: localProduct.ingredient.id,
      baseUnit: baseUnit as any,
      avgWeight,
      productUnit: productUnit as any,
      expiryDate: toIsoStartOfDayUtc(localProduct.expiryDate),
      comment: localProduct.notes || undefined
    };
  }
}

// Создаем и экспортируем единственный экземпляр
export const fridgeApiService = new FridgeApiService();
export default fridgeApiService;