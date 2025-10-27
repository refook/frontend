import React from 'react';
import CommentCard, {
  type CommentItem,
} from '../../../../pages/AdvancedProfile/components/CommentCard';
import type { RecipeCommentsSectionProps } from '../../RecipePreview.types';
import styles from './CommentsSection.module.css';

const CommentsSection: React.FC<RecipeCommentsSectionProps> = ({ recipe, title }) => (
  <div className={styles.section}>
    <h3 className={styles.title}>Комментарии</h3>
    {(
      [
        {
          id: 'c1',
          recipeTitle: title || 'Рецепт',
          recipeAuthor: recipe?.author?.name || 'Автор',
          recipeImage: recipe?.image,
          rating: Math.max(0, Math.min(5, Math.round((recipe?.stats?.rating ?? 4.8)))) || 4,
          verified: true,
          text: 'Очень вкусно! Обязательно приготовлю ещё раз.',
          likes: 3,
          replies: 1,
          dateISO: new Date().toISOString(),
        },
        {
          id: 'c2',
          recipeTitle: title || 'Рецепт',
          recipeAuthor: recipe?.author?.name || 'Автор',
          recipeImage: recipe?.image,
          rating: 5,
          verified: false,
          text: 'Спасибо за рецепт, получилось отлично!',
          likes: 1,
          replies: 0,
          dateISO: new Date(Date.now() - 86400000).toISOString(),
        },
      ] as CommentItem[]
    ).map((comment) => (
      <div key={comment.id} className={styles.listItem}>
        <CommentCard item={comment} />
      </div>
    ))}
  </div>
);

export default CommentsSection;
