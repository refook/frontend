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
import {API_BASE_URL} from "./api.ts";

// Функция для получения авторизационных заголовков
// централизованные заголовки и fetch

class FridgeApiService {
  // ---------------- Fridges (контейнеры) ----------------

  /**
   * Получить список холодильников текущего пользователя
   */
  async getUserFridges(): Promise<FridgeResponseDto[]> {
    const url = `${API_BASE_URL}/fridges`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);
    try {
      const response = await authorizedFetch(url, { method: 'GET', headers });
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('API холодильника вернул 404 — используем пустой список');
          return [];
        }
        throw new Error(`Не удалось загрузить холодильники: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('getUserFridges fallback triggered:', error);
      return [];
    }
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
        const errorText = await response.text();
        console.error('API Error Response (getAllFridgeProducts):', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
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
  private buildUpdateDto(
    current: FridgeProduct,
    updates: Partial<UpdateFridgeProductDto> & {
      count?: number;
      comment?: string | null;
      measureId?: string;
      expiryDate?: string | null;
    }
  ): UpdateFridgeProductDto {
    const toIsoFromDateInput = (dateStr?: string | null): string | null => {
      if (!dateStr) return null;
      const trimmed = dateStr.trim();
      if (!trimmed) return null;
      if (trimmed.includes('T')) {
        return trimmed;
      }
      const [year, month, day] = trimmed.split('-').map(Number);
      if (!year || !month || !day) return null;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${year}-${pad(month)}-${pad(day)}T00:00:00`;
    };

    const resolvedExpiryDate: string | null = (() => {
      if (Object.prototype.hasOwnProperty.call(updates, 'expiryDate')) {
        if (updates.expiryDate === null) return null;
        return toIsoFromDateInput(updates.expiryDate);
      }
      return current.expiryDate ? current.expiryDate.toISOString() : null;
    })();

    const resolvedComment = (() => {
      if (Object.prototype.hasOwnProperty.call(updates, 'comment')) {
        const next = updates.comment;
        if (next === null) return undefined;
        const trimmed = (next ?? '').toString().trim();
        return trimmed || undefined;
      }
      return current.comment ?? undefined;
    })();

    const resolvedMeasureId = updates.measureId || current.measure.id;

    return {
      productId: updates.productId || current.productId,
      isVariant: typeof updates.isVariant === 'boolean' ? updates.isVariant : current.isVariant,
      count: typeof updates.count === 'number' && !Number.isNaN(updates.count)
        ? updates.count
        : current.count,
      measureId: resolvedMeasureId,
      expiryDate: resolvedExpiryDate,
      comment: resolvedComment
    };
  }

  async updateFridgeProduct(
    fridgeId: string,
    fridgeProductId: string,
    updateData: Partial<UpdateFridgeProductDto> & {
      count?: number;
      comment?: string | null;
      measureId?: string;
      expiryDate?: string | null;
    },
    current: FridgeProduct
  ): Promise<FridgeProduct> {
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
    const createdAtStr = (apiProduct as any).createdAt as string | undefined;
    const updatedAtStr = (apiProduct as any).updatedAt as string | undefined;
    const createdAt = createdAtStr ? new Date(createdAtStr) : new Date();
    const updatedAt = updatedAtStr ? new Date(updatedAtStr) : new Date();

    const measure = (apiProduct as any).measure
      ? (apiProduct as any).measure
      : {
          id: `${apiProduct.productId}-measure-placeholder`,
          name: 'Без меры',
          weight: 0,
          isDefault: false,
          density: undefined
        };

    const weightPerMeasure = typeof measure.weight === 'number' ? measure.weight : 0;
    const derivedAmount = weightPerMeasure > 0
      ? apiProduct.count * weightPerMeasure
      : apiProduct.count;
    const derivedUnit = 'GR';
    const derivedBaseUnit = weightPerMeasure > 0 ? ('GR' as const) : undefined;

    return {
      id: apiProduct.id,
      productId: apiProduct.productId,
      ingredient: {
        id: apiProduct.productId,
        name: apiProduct.name,
        description: undefined
      },
      isVariant: Boolean(apiProduct.isVariant),
      count: apiProduct.count,
      measure,
      amount: derivedAmount,
      unit: derivedUnit,
      baseUnit: derivedBaseUnit,
      expiryDate: apiProduct.expiryDate ? new Date(apiProduct.expiryDate) : undefined,
      comment: apiProduct.comment ?? undefined,
      notes: apiProduct.comment ?? undefined,
      addedAt: createdAt,
      updatedAt
    };
  }

  /**
   * Преобразовать локальные данные в формат для API
   */
  transformLocalProductToApi(localProduct: {
    productId: string;
    isVariant: boolean;
    count: number | string;
    measureId: string;
    expiryDate?: string | null;
    comment?: string | null;
  }): CreateFridgeProductDto {
    const toApiDate = (value?: string | null): string | null => {
      if (value === null) return null;
      if (!value) return null;
      const trimmed = value.trim();
      if (!trimmed) return null;
      if (trimmed.includes('T')) {
        return trimmed;
      }
      const [year, month, day] = trimmed.split('-').map(Number);
      if (!year || !month || !day) return null;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${year}-${pad(month)}-${pad(day)}T00:00:00`;
    };

    const numericCount = Number(localProduct.count);
    if (!Number.isFinite(numericCount)) {
      throw new Error('Некорректное значение количества продукта');
    }

    const comment = localProduct.comment ?? undefined;
    const normalizedComment = typeof comment === 'string' ? comment.trim() || undefined : comment;

    return {
      productId: localProduct.productId,
      isVariant: localProduct.isVariant,
      count: numericCount,
      measureId: localProduct.measureId,
      expiryDate: toApiDate(localProduct.expiryDate),
      comment: normalizedComment
    };
  }
}

// Создаем и экспортируем единственный экземпляр
export const fridgeApiService = new FridgeApiService();
export default fridgeApiService;
