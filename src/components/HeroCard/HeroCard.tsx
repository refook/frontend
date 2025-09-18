import React from 'react';
import styles from './HeroCard.module.css';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface Props {
  title: string;
  description?: string;
  rating?: number;
  author?: string;
  imageUrl?: string;
  actionsSlot?: React.ReactNode;
  viewsCount?: number;
}

/**
 * Компонент HeroCard — крупная карточка-заставка рецепта.
 * Отображает изображение‑плейсхолдер, заголовок, необязательное описание,
 * рейтинг со звёздами и автора.
 *
 * @param title Заголовок карточки (название рецепта/подборки).
 * @param description Необязательное краткое описание блока.
 * @param rating Необязательный рейтинг по 5‑балльной шкале (по умолчанию 4.8).
 * @param author Необязательное имя автора (по умолчанию «Автор»).
 */
const HeroCard: React.FC<Props> = ({ title, description, rating = 4.8, author = 'Автор', imageUrl, actionsSlot, viewsCount }) => {
  return (
    <div className={styles.card}>
      {imageUrl ? (
        <img className={styles.imageTag} src={imageUrl} alt={title} />
      ) : (
        <div className={styles.image} />
      )}
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>{title}</h1>
          {actionsSlot && <div className={styles.actions}>{actionsSlot}</div>}
        </div>
        {description && <p className={styles.description}>{description}</p>}
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {[0,1,2,3,4].map(i => <StarSolidIcon key={i} className={styles.starIcon} />)}
          </div>
          <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
          {typeof viewsCount === 'number' && (
            <span className={styles.viewsValue}>· {viewsCount} просмотров</span>
          )}
        </div>
        <div className={styles.author}>
          <span className={styles.authorAvatar}>👨‍🍳</span>
          <span className={styles.authorText}>by {author}</span>
        </div>
      </div>
    </div>
  );
};

export default HeroCard;


