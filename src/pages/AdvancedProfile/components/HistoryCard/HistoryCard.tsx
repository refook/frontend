import React from 'react';
import styles from './HistoryCard.module.css';
import { CalendarDaysIcon, ClockIcon, StarIcon as StarOutlineIcon, BeakerIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { FOOD_PLACEHOLDER_EMOJIS, hashStringToIndex } from '../../../../utils/emoji';

/**
 * Статус активности приготовления рецепта.
 */
export type HistoryStatus = 'COOKED' | 'ATTEMPTED' | 'FAILED';

/**
 * История приготовления одного рецепта.
 * @property id Уникальный идентификатор события
 * @property recipeTitle Название рецепта
 * @property authorName Имя автора рецепта
 * @property photo Фото приготовленного блюда (опционально)
 * @property comment Текстовый отзыв пользователя (опционально)
 * @property rating Оценка пользователя по 5‑балльной шкале
 * @property durationMin Время приготовления в минутах
 * @property status Статус исхода (приготовлен/попытка/провал)
 * @property dateISO Дата события в ISO‑формате
 */
export interface HistoryItem {
  id: string;
  recipeTitle: string;
  authorName: string;
  photo?: string;
  comment?: string;
  rating: number; // 0..5
  durationMin: number;
  status: HistoryStatus;
  dateISO: string;
}

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
};

const statusMeta: Record<HistoryStatus, { label: string; className: string; Icon: React.ComponentType<any> }> = {
  COOKED: { label: 'Cooked', className: styles.status_cooked, Icon: CheckCircleIcon },
  ATTEMPTED: { label: 'Attempted', className: styles.status_attempted, Icon: BeakerIcon },
  FAILED: { label: 'Failed', className: styles.status_failed, Icon: XCircleIcon }
};

const Stars: React.FC<{ value: number }> = ({ value }) => (
  <span className={styles.stars} aria-label={`Rating ${value} of 5`}>
    {Array.from({ length: 5 }).map((_, i) =>
      i < value ? (
        <StarSolidIcon key={i} className={styles.star} />
      ) : (
        <StarOutlineIcon key={i} className={styles.star} />
      )
    )}
  </span>
);

/**
 * Карточка элемента истории — краткая активность приготовления рецепта.
 * Показывает превью, название и автора, статус, рейтинг, длительность,
 * пользовательский комментарий и дату события.
 *
 * @param props Параметры
 * @param props.item Объект события `HistoryItem`
 */
const HistoryCard: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const placeholder = FOOD_PLACEHOLDER_EMOJIS[
    hashStringToIndex(item.recipeTitle, FOOD_PLACEHOLDER_EMOJIS.length)
  ];
  const meta = statusMeta[item.status];

  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        {item.photo ? (
          <img src={item.photo} alt={item.recipeTitle} className={styles.thumb} />
        ) : (
          <span aria-label="placeholder">{placeholder}</span>
        )}
      </div>

      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>{item.recipeTitle}</h3>
          <span className={styles.author}>by {item.authorName}</span>
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={`${styles.statusChip} ${meta.className}`}>
              <meta.Icon className={styles.statusIcon} />
              <span className={styles.statusLabel}>{meta.label}</span>
            </span>
          </div>
          <div className={styles.metaItem}>
            <Stars value={item.rating} />
          </div>
          <div className={styles.metaItem}>
            <ClockIcon className={styles.metaIcon} />
            <span>{formatTime(item.durationMin)}</span>
          </div>
        </div>

        {item.comment && <div className={styles.comment}>&quot;{item.comment}&quot;</div>}

        <div className={styles.date}>
          <CalendarDaysIcon className={styles.dateIcon} />
          <span>{formatDate(item.dateISO)}</span>
        </div>
      </div>
    </article>
  );
};

export default HistoryCard;


