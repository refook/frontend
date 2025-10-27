import { useContext, useEffect, useState } from 'react';
import type { Recipe } from '../../../types';
import { RecipesService } from '../../../services/recipesService';
import { KeycloakContext } from '../../../providers/KeycloakProvider';
import type { RecipeSocialState, RecipeStatsSnapshot } from '../RecipePreview.types';

type Params = {
  recipeData?: Recipe;
  isFormData: boolean;
  stats: RecipeStatsSnapshot;
};

/**
 * Хук управляет социальными действиями пользователя над рецептом.
 * @desc Локально хранит состояние лайка/избранного/оценки, выполняет запросы к API
 * и автоматически синхронизируется при смене входящих данных.
 * @note Использует KeycloakContext для проверки авторизации и централизует все
 * side-effect'ы, чтобы UI оставался чистым.
 */
export const useRecipeSocialState = ({ recipeData, isFormData, stats }: Params): RecipeSocialState => {
  const keycloakCtx = useContext(KeycloakContext);
  const isAuthenticated = !!keycloakCtx?.authenticated;
  const recipeId = recipeData?.id;

  const initialLikes = !isFormData ? stats.likes : 0;
  const initialFavorites = !isFormData ? stats.favorites : 0;
  const initialLiked = !isFormData ? Boolean(recipeData?.state?.liked) : false;
  const initialFavorite = !isFormData ? Boolean(recipeData?.state?.favorite) : false;
  const initialRating = !isFormData
    ? (() => {
        const stateRate = recipeData?.state?.rate;
        if (stateRate !== null && stateRate !== undefined) return stateRate;
        return stats.rating;
      })()
    : 0;

  const [likesCount, setLikesCount] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [likeLoading, setLikeLoading] = useState(false);
  const [favorite, setFavorite] = useState(initialFavorite);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(initialFavorites);
  const [rating, setRating] = useState(initialRating);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    if (isFormData || !recipeId) return;
    setLikesCount(stats.likes);
    setLiked(Boolean(recipeData?.state?.liked));
    setFavorite(Boolean(recipeData?.state?.favorite));
    setFavoritesCount(stats.favorites);
    const stateRate = recipeData?.state?.rate;
    if (stateRate !== null && stateRate !== undefined) {
      setRating(stateRate);
    } else {
      setRating(stats.rating);
    }
  }, [
    isFormData,
    recipeId,
    stats.likes,
    stats.favorites,
    stats.rating,
    recipeData?.state?.liked,
    recipeData?.state?.favorite,
    recipeData?.state?.rate,
  ]);

  const handleToggleLike = async () => {
    if (isFormData || !recipeId || !isAuthenticated || likeLoading) return;
    const next = !liked;
    setLiked(next);
    setLikesCount((prev) => prev + (next ? 1 : -1));
    setLikeLoading(true);
    try {
      await RecipesService.toggleLike(recipeId, next);
    } catch (error) {
      console.error('Не удалось выполнить действие LIKE:', error);
      setLiked(!next);
      setLikesCount((prev) => prev + (next ? -1 : 1));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (isFormData || !recipeId || !isAuthenticated || favoriteLoading) return;
    const next = !favorite;
    setFavorite(next);
    setFavoritesCount((prev) => Math.max(0, prev + (next ? 1 : -1)));
    setFavoriteLoading(true);
    try {
      await RecipesService.toggleFavorite(recipeId, next);
    } catch (error) {
      console.error('Не удалось выполнить действие FAVORITE:', error);
      setFavorite(!next);
      setFavoritesCount((prev) => Math.max(0, prev + (next ? -1 : 1)));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSetRating = async (value: number) => {
    if (isFormData || !recipeId || !isAuthenticated || ratingLoading) return;
    const prev = rating;
    setRating(value);
    setRatingLoading(true);
    try {
      await RecipesService.setRating(recipeId, value);
    } catch (error) {
      console.error('Не удалось выполнить действие SET_RATE:', error);
      setRating(prev);
    } finally {
      setRatingLoading(false);
    }
  };

  return {
    likesCount,
    liked,
    likeLoading,
    favorite,
    favoriteLoading,
    favoritesCount,
    rating,
    ratingLoading,
    isAuthenticated,
    onToggleLike: handleToggleLike,
    onToggleFavorite: handleToggleFavorite,
    onSetRating: handleSetRating,
    recipeId,
  };
};
