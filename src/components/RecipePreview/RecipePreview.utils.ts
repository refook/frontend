import { API_BASE_URL } from '../../services/api';
import type { BadgeResponseDto, Recipe } from '../../types';
import type { RecipeStatsSnapshot } from './RecipePreview.types';

export const difficultyMap: Record<string, string> = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

export const difficultyColor: Record<string, string> = {
  easy: 'var(--color-success)',
  medium: 'var(--color-warning)',
  hard: 'var(--color-danger)',
};

export const rarityLabels: Record<BadgeResponseDto['rarity'], string> = {
  UNCOMMON: 'Необычный',
  COMMON: 'Обычный',
  RARE: 'Редкий',
  EPIC: 'Эпический',
  LEGENDARY: 'Легендарный',
};

export const rarityColors: Record<BadgeResponseDto['rarity'], string> = {
  COMMON: '#9CA3AF',
  UNCOMMON: '#10B981',
  RARE: '#3B82F6',
  EPIC: '#A855F7',
  LEGENDARY: '#F59E0B',
};

export const subjectLabels: Record<BadgeResponseDto['subjectType'], string> = {
  USER: 'Пользователь',
  RECIPE: 'Рецепт',
};

export const pickNumber = (...values: unknown[]): number => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

export const getRecipeStatsSnapshot = (recipe?: Recipe): RecipeStatsSnapshot => {
  const source = (recipe as any)?.stats ?? (recipe as any)?.statistic ?? (recipe as any)?.statistics ?? {};
  const stats = typeof source === 'object' && source !== null ? source : {};

  return {
    views: pickNumber(
      (stats as any).views,
      (stats as any).viewsCount,
      (stats as any).viewCount,
      (stats as any).totalViews,
    ),
    likes: pickNumber(
      (stats as any).likes,
      (stats as any).likesCount,
      (stats as any).likeCount,
      (stats as any).totalLikes,
    ),
    favorites: pickNumber(
      (stats as any).favorites,
      (stats as any).favoritesCount,
      (stats as any).saves,
      (stats as any).savesCount,
      (stats as any).bookmarks,
      (stats as any).bookmarkCount,
    ),
    rating: pickNumber(
      (stats as any).avgRating,
      (stats as any).averageRating,
      (stats as any).averageRate,
      (stats as any).rating,
    ),
    ratingsCount: pickNumber(
      (stats as any).ratingsCount,
      (stats as any).ratingCount,
      (stats as any).reviewsCount,
      (stats as any).commentsCount,
      (stats as any).votesCount,
    ),
  };
};

export const isBadgeResponse = (value: unknown): value is BadgeResponseDto => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === 'string' && record.id.trim().length > 0 && typeof record.title === 'string';
};

export const resolveBadgeIcon = (icon?: string | null): { url?: string; text?: string } => {
  if (typeof icon !== 'string') return {};
  const trimmed = icon.trim();
  if (!trimmed) return {};
  if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed) || trimmed.startsWith('blob:')) {
    return { url: trimmed };
  }
  if (trimmed.startsWith('/')) {
    return { url: `${API_BASE_URL}${trimmed}` };
  }
  if (trimmed.includes('.')) {
    return { url: `${API_BASE_URL}/photo/${trimmed}` };
  }
  return { text: trimmed };
};

export const getBadgeInitial = (title?: string): string => {
  if (!title || typeof title !== 'string') return '🏅';
  const trimmed = title.trim();
  if (!trimmed) return '🏅';
  return trimmed.charAt(0).toUpperCase();
};
