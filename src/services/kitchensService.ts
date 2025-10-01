import { apiLogger } from '../utils/apiLogger';
import { API_BASE_URL } from './api';
import { getAuthHeaders, authorizedFetch } from './auth';

// централизованные заголовки из services/auth

export interface KitchenResponseDto {
  id: string;
  name: string;
}

export class KitchensService {
  static async getAll(): Promise<KitchenResponseDto[]> {
    try {
      const url = `${API_BASE_URL}/kitchens/all`;
      const headers = getAuthHeaders();
      apiLogger.logRequest(url, 'GET', headers);
      const res = await authorizedFetch(url, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const arr = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.content)
            ? raw.content
            : Array.isArray(raw?.items)
              ? raw.items
              : [];

      // Нормализуем к { id, name }
      return arr
        .map((k: any) => ({ id: k?.id ?? k?.uuid ?? k?.value, name: k?.name ?? k?.title ?? k?.label }))
        .filter((k: KitchenResponseDto) => Boolean(k.id));
    } catch (e) {
      console.error('Не удалось получить список кухонь:', e);
      return [];
    }
  }

  static async create(name: string): Promise<KitchenResponseDto> {
    const url = `${API_BASE_URL}/kitchens`;
    const headers = getAuthHeaders();
    const body = { name };
    apiLogger.logRequest(url, 'POST', headers, body);
    const res = await authorizedFetch(url, { method: 'POST', body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  static async update(id: string, name: string): Promise<KitchenResponseDto> {
    const url = `${API_BASE_URL}/kitchens/${id}`;
    const headers = getAuthHeaders();
    const body = { name };
    apiLogger.logRequest(url, 'PUT', headers, body);
    const res = await authorizedFetch(url, { method: 'PUT', body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  static async search(name: string): Promise<KitchenResponseDto[]> {
    try {
      const url = `${API_BASE_URL}/kitchens/search?name=${encodeURIComponent(name)}`;
      const headers = getAuthHeaders();
      apiLogger.logRequest(url, 'GET', headers);
      const res = await authorizedFetch(url, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error('Не удалось выполнить поиск кухонь:', e);
      return [];
    }
  }
}

export default KitchensService;


