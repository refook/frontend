import { API_BASE_URL } from './api';
import { authorizedFetch, getAuthHeaders } from './auth';
import { apiLogger } from '../utils/apiLogger';
import type { CreateProductDto, UpdateProductDto, ProductResponseDto, ProductMeasureResponseDto, UpdateBaseProductMeasureDto, AddBaseProductMeasureDto, ChangeProductVariantDto, AddProductVariantMeasureDto } from '../types/api.types';

class ProductsService {
  async getAllProducts(): Promise<Array<{ id: string; name: string; description?: string }>> {
    const url = `${API_BASE_URL}/products/all`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);

    const response = await authorizedFetch(url, { method: 'GET', headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

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

  async updateProduct(id: string, dto: UpdateProductDto): Promise<{ id: string }> {
    const url = `${API_BASE_URL}/products/${id}`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'PUT', headers, dto);

    const response = await authorizedFetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return response.json();
  }

  async getProductById(id: string): Promise<ProductResponseDto> {
    const url = `${API_BASE_URL}/products/${id}`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);

    const response = await authorizedFetch(url, { method: 'GET', headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async searchProductsByName(name: string): Promise<ProductResponseDto[]> {
    const url = `${API_BASE_URL}/products/search?name=${encodeURIComponent(name)}`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);

    const response = await authorizedFetch(url, { method: 'GET', headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async getBaseMeasures(productId: string): Promise<ProductMeasureResponseDto[]> {
    const url = `${API_BASE_URL}/products/measures/base/${productId}/all`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);

    const response = await authorizedFetch(url, { method: 'GET', headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async updateBaseMeasure(productId: string, dto: UpdateBaseProductMeasureDto): Promise<{ id: string }> {
    const url = `${API_BASE_URL}/products/measures/base/${productId}`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'PUT', headers, dto);

    const response = await authorizedFetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async addBaseMeasure(productId: string, dto: AddBaseProductMeasureDto): Promise<{ id: string }> {
    const url = `${API_BASE_URL}/products/measures/base/${productId}`;
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

  async saveProductVariant(productId: string, dto: ChangeProductVariantDto): Promise<{ id: string }> {
    const url = `${API_BASE_URL}/products/variants/${productId}`;
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

  async getAllProductVariants(): Promise<ProductResponseDto[]> {
    const url = `${API_BASE_URL}/products/variants/all`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);

    const response = await authorizedFetch(url, { method: 'GET', headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async getProductVariantsByProduct(productId: string): Promise<ProductResponseDto[]> {
    const url = `${API_BASE_URL}/products/variants/${productId}/all`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);

    const response = await authorizedFetch(url, { method: 'GET', headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async updateProductVariant(variantId: string, dto: ChangeProductVariantDto): Promise<{ id: string }> {
    const url = `${API_BASE_URL}/products/variants/${variantId}`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'PUT', headers, dto);

    const response = await authorizedFetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async getProductVariantById(variantId: string): Promise<ProductResponseDto> {
    const url = `${API_BASE_URL}/products/variants/${variantId}`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);

    const response = await authorizedFetch(url, { method: 'GET', headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async getVariantMeasures(productVariantId: string, onlyUnique?: boolean): Promise<ProductMeasureResponseDto[]> {
    const url = `${API_BASE_URL}/products/measures/variant/${productVariantId}/all${onlyUnique ? `?onlyUnique=${onlyUnique}` : ''}`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);

    const response = await authorizedFetch(url, { method: 'GET', headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async addVariantMeasure(productVariantId: string, dto: AddProductVariantMeasureDto): Promise<{ id: string }> {
    const url = `${API_BASE_URL}/products/measures/variant/${productVariantId}`;
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


