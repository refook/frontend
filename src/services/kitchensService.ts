import { apiLogger } from '../utils/apiLogger';
import { API_BASE_URL } from './api';
import { getAuthHeaders, authorizedFetch } from './auth';

// централизованные заголовки из services/auth

export interface KitchenResponseDto {
  id: string;
  name: string;
}

let kitchensCache: KitchenResponseDto[] | null = null;
let kitchensInflight: Promise<KitchenResponseDto[]> | null = null;

const toRecord = (value: unknown): Record<string, unknown> | null => {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
};

const toNonEmptyString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return null;
};

const extractArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  const record = toRecord(value);
  if (!record) return [];
  for (const key of ['data', 'content', 'items']) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

const normalizeKitchens = (payload: unknown): KitchenResponseDto[] => {
  const source = extractArray(payload);
  return source
    .map((entry) => {
      const record = toRecord(entry);
      if (!record) return null;
      const id = toNonEmptyString(record.id ?? record.uuid ?? record.value);
      if (!id) return null;
      const name = toNonEmptyString(record.name ?? record.title ?? record.label) ?? 'Без названия';
      return { id, name } satisfies KitchenResponseDto;
    })
    .filter((item): item is KitchenResponseDto => item !== null);
};

const requestAllKitchens = async (): Promise<KitchenResponseDto[]> => {
  const url = `${API_BASE_URL}/kitchens/all`;
  const headers = getAuthHeaders();
  apiLogger.logRequest(url, 'GET', headers);
  const res = await authorizedFetch(url, { method: 'GET', headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  const normalized = normalizeKitchens(raw);
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
