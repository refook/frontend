import React from 'react';
import styles from './HeroCard.module.css';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface Props {
  title: string;
  description?: string;
  rating?: number;
  author?: string;
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
const HeroCard: React.FC<Props> = ({ title, description, rating = 4.8, author = 'Автор' }) => {
  return (
    <div className={styles.card}>
      <div className={styles.image} />
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {[0,1,2,3,4].map(i => <StarSolidIcon key={i} className={styles.starIcon} />)}
          </div>
          <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
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


