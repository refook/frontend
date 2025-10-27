import React from 'react';
import ActionToggle from '../../../ActionToggle/ActionToggle';
import type { RecipeSocialActionsProps } from '../../RecipePreview.types';
import styles from './SocialActions.module.css';

const SocialActions: React.FC<RecipeSocialActionsProps> = ({
  liked,
  likesCount,
  likeLoading,
  favorite,
  favoriteLoading,
  isAuthenticated,
  onToggleLike,
  onToggleFavorite,
  favoritesCount,
}) => (
  <div className={styles.actions}>
    <ActionToggle
      type="like"
      active={liked}
      loading={likeLoading}
      disabled={!isAuthenticated}
      count={likesCount}
      onToggle={onToggleLike}
    />
    <ActionToggle
      type="favorite"
      active={favorite}
      loading={favoriteLoading}
      disabled={!isAuthenticated}
      count={favoritesCount}
      onToggle={onToggleFavorite}
    />
  </div>
);

export default SocialActions;
