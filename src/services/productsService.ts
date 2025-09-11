import { API_BASE_URL } from './api';
import { authorizedFetch, getAuthHeaders } from './auth';
import { apiLogger } from '../utils/apiLogger';
import type { CreateProductDto } from '../types/api.types';

class ProductsService {
  async createProduct(dto: CreateProductDto): Promise<{ id: string }> {
    const url = `${API_BASE_URL}/products`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'POST', headers, dto);

    const response = await authorizedFetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return response.json();
  }
}

export const productsService = new ProductsService();
export default productsService;


