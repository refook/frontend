import { apiLogger } from '../utils/apiLogger';
import { API_BASE_URL } from './api';
import { authorizedFetch, getAuthHeaders } from './auth';
import type { TagResponseDto } from '../types/recipe.types';

let tagsCache: TagResponseDto[] | null = null;
let tagsInflight: Promise<TagResponseDto[]> | null = null;

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

const normalizeTags = (payload: unknown): TagResponseDto[] => {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((entry) => {
      const record = toRecord(entry);
      if (!record) return null;
      const id = toNonEmptyString(record.id ?? record.uuid ?? record.value);
      const name = toNonEmptyString(record.name ?? record.title ?? record.label);
      if (!id || !name) return null;
      return { id, name } satisfies TagResponseDto;
    })
    .filter((tag): tag is TagResponseDto => tag !== null);
};

const requestAllTags = async (): Promise<TagResponseDto[]> => {
  const url = `${API_BASE_URL}/tags/all`;
  const headers = getAuthHeaders();
  apiLogger.logRequest(url, 'GET', headers);
  const response = await authorizedFetch(url, { method: 'GET', headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  const normalized = normalizeTags(json);
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
}

export const tagsService = TagsService;
