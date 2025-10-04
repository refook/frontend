import { apiLogger } from '../utils/apiLogger';
import { API_BASE_URL } from './api';
import { authorizedFetch, getAuthHeaders } from './auth';
import type { TagResponseDto } from '../types/recipe.types';
import { ensureNamedEntityArray } from './namedEntityUtils';

let tagsCache: TagResponseDto[] | null = null;
let tagsInflight: Promise<TagResponseDto[]> | null = null;

const requestAllTags = async (): Promise<TagResponseDto[]> => {
  const url = `${API_BASE_URL}/tags/all`;
  const headers = getAuthHeaders();
  apiLogger.logRequest(url, 'GET', headers);
  const response = await authorizedFetch(url, { method: 'GET', headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  const normalized = ensureNamedEntityArray<TagResponseDto>(json);
  tagsCache = normalized;
  return normalized;
};

export class TagsService {
  static async getAll(options?: { force?: boolean }): Promise<TagResponseDto[]> {
    const force = options?.force ?? false;
    if (force) {
      tagsCache = null;
      if (tagsInflight) {
        tagsInflight.catch(() => undefined);
        tagsInflight = null;
      }
    } else if (tagsCache) {
      return tagsCache;
    }

    if (!tagsInflight) {
      tagsInflight = requestAllTags()
        .catch((error) => {
          tagsCache = null;
          throw error;
        })
        .finally(() => {
          tagsInflight = null;
        });
    }

    const inflight = tagsInflight;
    if (!inflight) {
      return tagsCache ?? [];
    }

    return inflight;
  }

  static clearCache(): void {
    tagsCache = null;
  }

  static async search(name: string): Promise<TagResponseDto[]> {
    const url = `${API_BASE_URL}/tags/search?name=${encodeURIComponent(name)}`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);
    const response = await authorizedFetch(url, { method: 'GET', headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return ensureNamedEntityArray<TagResponseDto>(data);
  }

  static async update(id: string, name: string): Promise<TagResponseDto> {
    const url = `${API_BASE_URL}/tags/${id}`;
    const headers = getAuthHeaders();
    const body = { name };
    apiLogger.logRequest(url, 'PUT', headers, body);
    const response = await authorizedFetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const updated = await response.json();
    tagsCache = tagsCache?.map((tag) => (tag.id === id ? { ...tag, name } : tag)) ?? null;
    return updated as TagResponseDto;
  }
}

export const tagsService = TagsService;
