import { apiLogger } from '../utils/apiLogger';
import { API_BASE_URL } from './api';
import { getAuthHeaders, authorizedFetch } from './auth';
import { ensureNamedEntityArray } from './namedEntityUtils';

// централизованные заголовки из services/auth

export interface KitchenResponseDto {
  id: string;
  name: string;
}

let kitchensCache: KitchenResponseDto[] | null = null;
let kitchensInflight: Promise<KitchenResponseDto[]> | null = null;

const requestAllKitchens = async (): Promise<KitchenResponseDto[]> => {
  const url = `${API_BASE_URL}/kitchens/all`;
  const headers = getAuthHeaders();
  apiLogger.logRequest(url, 'GET', headers);
  const res = await authorizedFetch(url, { method: 'GET', headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  const normalized = ensureNamedEntityArray<KitchenResponseDto>(raw);
  kitchensCache = normalized;
  return normalized;
};

export class KitchensService {
  static async getAll(options?: { force?: boolean }): Promise<KitchenResponseDto[]> {
    try {
      const force = options?.force ?? false;
      if (force) {
        kitchensCache = null;
        if (kitchensInflight) {
          kitchensInflight.catch(() => undefined);
          kitchensInflight = null;
        }
      } else if (kitchensCache) {
        return kitchensCache;
      }

      if (!kitchensInflight) {
        kitchensInflight = requestAllKitchens().catch((error) => {
          kitchensCache = null;
          throw error;
        }).finally(() => {
          kitchensInflight = null;
        });
      }

      const inflight = kitchensInflight;
      if (!inflight) return kitchensCache ?? [];

      const result = await inflight;
      return result;
    } catch (e) {
      console.error('Не удалось получить список кухонь:', e);
      return [];
    }
  }

  static clearCache(): void {
    kitchensCache = null;
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
      const res = await authorizedFetch(url, { method: 'GET', headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return ensureNamedEntityArray<KitchenResponseDto>(data);
    } catch (e) {
      console.error('Не удалось выполнить поиск кухонь:', e);
      return [];
    }
  }
}

export default KitchensService;
