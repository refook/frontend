import { apiLogger } from '../utils/apiLogger';
import { API_BASE_URL } from './api';
import { authorizedFetch, getAuthHeaders } from './auth';
import { ensureNamedEntityArray } from './namedEntityUtils';
import type { CategoryResponseDto } from '../types/category.types';

let categoriesCache: CategoryResponseDto[] | null = null;
let categoriesInflight: Promise<CategoryResponseDto[]> | null = null;

const requestAllCategories = async (): Promise<CategoryResponseDto[]> => {
  const url = `${API_BASE_URL}/categories/all`;
  const headers = getAuthHeaders();
  apiLogger.logRequest(url, 'GET', headers);
  const response = await authorizedFetch(url, { method: 'GET', headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  const normalized = ensureNamedEntityArray<CategoryResponseDto>(data);
  categoriesCache = normalized;
  return normalized;
};

export class CategoriesService {
  static async getAll(options?: { force?: boolean }): Promise<CategoryResponseDto[]> {
    try {
      const force = options?.force ?? false;
      if (force) {
        categoriesCache = null;
        if (categoriesInflight) {
          categoriesInflight.catch(() => undefined);
          categoriesInflight = null;
        }
      } else if (categoriesCache) {
        return categoriesCache;
      }

      if (!categoriesInflight) {
        categoriesInflight = requestAllCategories()
          .catch((error) => {
            categoriesCache = null;
            throw error;
          })
          .finally(() => {
            categoriesInflight = null;
          });
      }

      const inflight = categoriesInflight;
      if (!inflight) {
        return categoriesCache ?? [];
      }

      return await inflight;
    } catch (error) {
      console.error('Не удалось получить список категорий:', error);
      return [];
    }
  }

  static clearCache(): void {
    categoriesCache = null;
  }

  static async create(name: string): Promise<CategoryResponseDto> {
    const url = `${API_BASE_URL}/categories`;
    const headers = getAuthHeaders();
    const body = { name };
    apiLogger.logRequest(url, 'POST', headers, body);
    const response = await authorizedFetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const created = (await response.json()) as CategoryResponseDto;
    categoriesCache = categoriesCache ? [...categoriesCache, created] : null;
    return created;
  }

  static async update(id: string, name: string): Promise<CategoryResponseDto> {
    const url = `${API_BASE_URL}/categories/${id}`;
    const headers = getAuthHeaders();
    const body = { name };
    apiLogger.logRequest(url, 'PUT', headers, body);
    const response = await authorizedFetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const updated = (await response.json()) as CategoryResponseDto;
    categoriesCache = categoriesCache?.map((category) => (category.id === id ? { ...category, name } : category)) ?? null;
    return updated;
  }

  static async search(name: string): Promise<CategoryResponseDto[]> {
    const url = `${API_BASE_URL}/categories/search?name=${encodeURIComponent(name)}`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);
    const response = await authorizedFetch(url, { method: 'GET', headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return ensureNamedEntityArray<CategoryResponseDto>(data);
  }
}

export default CategoriesService;
