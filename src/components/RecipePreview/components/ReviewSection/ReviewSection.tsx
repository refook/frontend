import React from 'react';
import RatingControl from '../../../RatingControl/RatingControl';
import type { RecipeReviewSectionProps } from '../../RecipePreview.types';
import styles from './ReviewSection.module.css';

/**
 * Секция отзывов в превью рецепта.
 * Показывает рейтинг с возможностью проставить оценку и текстовую форму,
 * пока недоступную для отправки (disabled).
 */
const ReviewSection: React.FC<RecipeReviewSectionProps> = ({
  rating,
  ratingLoading,
  isAuthenticated,
  onSetRating,
  ratingsCount,
}) => (
  <div className={styles.section}>
    <h3 className={styles.title}>Ваш отзыв</h3>
    <div className={styles.controls}>
      <span className={styles.label}>Оцените рецепт:</span>
      <RatingControl
        value={rating}
        loading={ratingLoading}
        disabled={!isAuthenticated}
        onChange={onSetRating}
        countLabel={`${ratingsCount} оценок`}
      />
    </div>
    <div className={styles.field}>
      <textarea
        className={styles.textarea}
        placeholder={
          isAuthenticated
            ? 'Поделитесь впечатлениями о рецепте… (скоро)'
            : 'Войдите, чтобы оставить отзыв'
        }
        disabled={!isAuthenticated}
        rows={4}
      />
    </div>
    <div className={styles.actions}>
      <button type="button" className="ui-btn ui-btn--flat" disabled>
        Отправить отзыв (скоро)
      </button>
    </div>
  </div>
);

export default ReviewSection;
