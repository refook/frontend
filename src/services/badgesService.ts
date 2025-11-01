import { apiLogger } from '../utils/apiLogger';
import { API_BASE_URL } from './api';
import { authorizedFetch, getAuthHeaders } from './auth';
import type { BadgeResponseDto } from '../types/recipe.types';

// Адаптер для совместимости с NamedEntityLike (использует name вместо title)
export interface BadgeEntityAdapter {
  id: string;
  name: string; // Маппинг из title
  original: BadgeResponseDto; // Оригинальный объект для обновления
}

let badgesCache: BadgeEntityAdapter[] | null = null;
let badgesInflight: Promise<BadgeEntityAdapter[]> | null = null;

const mapBadgeToAdapter = (badge: BadgeResponseDto): BadgeEntityAdapter => ({
  id: badge.id,
  name: badge.title, // Маппинг title -> name для совместимости
  original: badge,
});

const requestAllBadges = async (): Promise<BadgeEntityAdapter[]> => {
  const url = `${API_BASE_URL}/badges/all`;
  const headers = getAuthHeaders();
  apiLogger.logRequest(url, 'GET', headers);
  const response = await authorizedFetch(url, { method: 'GET', headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  const badges = Array.isArray(json) ? json : [];
  const normalized = badges.map(mapBadgeToAdapter);
  badgesCache = normalized;
  return normalized;
};

export class BadgesService {
  static async getAll(options?: { force?: boolean }): Promise<BadgeEntityAdapter[]> {
    const force = options?.force ?? false;
    if (force) {
      badgesCache = null;
      if (badgesInflight) {
        badgesInflight.catch(() => undefined);
        badgesInflight = null;
      }
    } else if (badgesCache) {
      return badgesCache;
    }

    if (!badgesInflight) {
      badgesInflight = requestAllBadges()
        .catch((error) => {
          badgesCache = null;
          throw error;
        })
        .finally(() => {
          badgesInflight = null;
        });
    }

    const inflight = badgesInflight;
    if (!inflight) {
      return badgesCache ?? [];
    }

    return inflight;
  }

  static clearCache(): void {
    badgesCache = null;
  }

  static async search(title: string): Promise<BadgeEntityAdapter[]> {
    const url = `${API_BASE_URL}/badges/search?title=${encodeURIComponent(title)}`;
    const headers = getAuthHeaders();
    apiLogger.logRequest(url, 'GET', headers);
    const response = await authorizedFetch(url, { method: 'GET', headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const badges = Array.isArray(data) ? data : [];
    return badges.map(mapBadgeToAdapter);
  }

  static async update(id: string, title: string): Promise<BadgeEntityAdapter> {
    // Получаем оригинальный бейдж для сохранения всех полей
    const allBadges = await this.getAll();
    const originalBadge = allBadges.find((b) => b.id === id)?.original;
    
    if (!originalBadge) {
      throw new Error(`Бейдж с id ${id} не найден`);
    }

    // Обновляем только title, сохраняя остальные поля
    const url = `${API_BASE_URL}/badges/${id}`;
    const headers = getAuthHeaders();
    const body = {
      title,
      code: originalBadge.code,
      description: originalBadge.description,
      subjectType: originalBadge.subjectType,
      icon: originalBadge.icon ?? '',
      rarity: originalBadge.rarity,
      conditions: originalBadge.conditions,
    };
    
    apiLogger.logRequest(url, 'PUT', headers, body);
    const response = await authorizedFetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const updated = await response.json();
    
    // Обновляем кэш
    badgesCache = badgesCache?.map((badge) => 
      badge.id === id ? mapBadgeToAdapter(updated as BadgeResponseDto) : badge
    ) ?? null;
    
    return mapBadgeToAdapter(updated as BadgeResponseDto);
  }
}

export default BadgesService;

