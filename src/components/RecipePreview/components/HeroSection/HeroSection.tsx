import React from 'react';
import HeroCard from '../../../HeroCard/HeroCard';
import type { RecipePreviewHeroProps } from '../../RecipePreview.types';
import styles from './HeroSection.module.css';

/**
 * Отрисовывает верхнюю "герой"-секцию превью рецепта.
 * Объединяет заголовок, описание, основное изображение, счётчик просмотров
 * и возможные действия пользователя (лайк, избранное) внутри карточки.
 */
const HeroSection: React.FC<RecipePreviewHeroProps> = ({
  title,
  description,
  imageUrl,
  author,
  rating,
  views,
  actionsSlot,
}) => (
  <div className={styles.root}>
    <HeroCard
      title={title}
      description={description}
      rating={rating}
      author={author}
      imageUrl={imageUrl}
      viewsCount={views}
      actionsSlot={actionsSlot}
    />
  </div>
);

export default HeroSection;
