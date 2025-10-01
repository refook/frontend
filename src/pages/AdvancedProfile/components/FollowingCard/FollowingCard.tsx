import React from 'react';
import styles from './FollowingCard.module.css';
import { MapPinIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

/**
 * Данные автора, на которого подписан пользователь.
 * @property id Уникальный идентификатор автора
 * @property name Полное имя автора
 * @property handle Короткий ник без символа @ (добавляется в компоненте)
 * @property avatarUrl URL аватарки (опционально)
 * @property bio Короткое описание/био (опционально)
 * @property location Город/страна (опционально)
 * @property stats Числовые показатели профиля
 * @property stats.followers Количество подписчиков
 * @property stats.recipes Количество рецептов
 * @property stats.rating Средняя оценка рецептов
 * @property tags Список тегов‑интересов/кухонь
 */
export type FollowingAuthor = {
  id: string;
  name: string;
  handle: string; // without @
  avatarUrl?: string;
  bio?: string;
  location?: string;
  stats: { followers: number; recipes: number; rating: number };
  tags: string[];
};

const formatNumber = (n: number) => n.toLocaleString('ru-RU');

/**
 * Карточка автора, на которого подписан пользователь.
 *
 * Отрисовывает: аватар, имя и `@handle`, био, локацию,
 * статблок (followers/recipes/rating), теги и CTA‑кнопку.
 *
 * @param props Параметры компонента
 * @param props.author Объект автора `FollowingAuthor`
 */
const FollowingCard: React.FC<{ author: FollowingAuthor }> = ({ author }) => {
  const a = author;
  const initials = a.name.split(' ').map(p => p[0]).slice(0,2).join('');
  return (
    <article className={styles.card}>
      <div className={styles.headerTop}>
        <div className={styles.avatar} aria-label={a.name}>
          {a.avatarUrl ? <img src={a.avatarUrl} alt={a.name} className={styles.avatar} /> : initials}
        </div>
        <div className={styles.titleWrap}>
          <h3 className={styles.name}>{a.name}</h3>
          <span className={styles.handle}>@{a.handle}</span>
        </div>
      </div>

      <div className={styles.content}>
        {a.bio && <p className={styles.bio}>{a.bio}</p>}
        {a.location && (
          <div className={styles.location}>
            <MapPinIcon className={styles.locationIcon} />
            <span>{a.location}</span>
          </div>
        )}

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{formatNumber(a.stats.followers)}</div>
            <div className={styles.statLabel}>Подписчики</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{a.stats.recipes}</div>
            <div className={styles.statLabel}>Рецепты</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValueRow}>
              <StarSolidIcon className={styles.ratingIcon} />
              <span className={styles.statValue}>{a.stats.rating}</span>
            </div>
            <div className={styles.statLabel}>Рейтинг</div>
          </div>
        </div>

        {a.tags && a.tags.length > 0 && (
          <div className={styles.tags}>
            {a.tags.map((t, i) => (
              <span key={i} className={styles.tag}>{t}</span>
            ))}
          </div>
        )}

        <div className={styles.cta}>
          <button className={styles.ctaBtn}>
            <BookOpenIcon className={styles.ctaIcon} />
            Смотреть рецепты
          </button>
        </div>
      </div>
    </article>
  );
};

export default FollowingCard;


