import React from 'react';
import styles from './CommentCard.module.css';
import { CalendarDaysIcon, HandThumbUpIcon, ChatBubbleLeftRightIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { FOOD_PLACEHOLDER_EMOJIS, hashStringToIndex } from '../../../../utils/emoji';

/**
 * Модель пользовательского комментария к рецепту.
 * @property id Уникальный идентификатор
 * @property recipeTitle Название рецепта
 * @property recipeAuthor Автор рецепта
 * @property recipeImage Обложка рецепта (опционально)
 * @property rating Оценка комментария (0..5)
 * @property verified Флаг "Подтверждённый повар" (опционально)
 * @property text Текст комментария
 * @property likes Количество лайков
 * @property replies Количество ответов
 * @property dateISO Дата публикации в ISO
 */
export interface CommentItem {
  id: string;
  recipeTitle: string;
  recipeAuthor: string;
  recipeImage?: string;
  rating: number; // 0..5
  verified?: boolean;
  text: string;
  likes: number;
  replies: number;
  dateISO: string;
}

/**
 * Ряд звёздочек рейтинга (0..5).
 * @param value Значение рейтинга
 */
const Stars: React.FC<{ value: number }> = ({ value }) => (
  <span className={styles.stars} aria-label={`Оценка ${value} из 5`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <StarSolidIcon key={i} className={styles.star} style={{ opacity: i < value ? 1 : 0.3 }} />
    ))}
  </span>
);

/**
 * Карточка комментария пользователя: заголовок рецепта, автор, дата,
 * рейтинг со звёздами, текст комментария и действия (лайк/ответ).
 * @param props Параметры
 * @param props.item Комментарий `CommentItem`
 */
const CommentCard: React.FC<{ item: CommentItem }> = ({ item }) => {
  const placeholder = FOOD_PLACEHOLDER_EMOJIS[hashStringToIndex(item.recipeTitle, FOOD_PLACEHOLDER_EMOJIS.length)];
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.left}>
          <div className={styles.thumb}>
            {item.recipeImage ? <img src={item.recipeImage} alt={item.recipeTitle} className={styles.thumb} /> : <span aria-label="заглушка">{placeholder}</span>}
          </div>
          <div className={styles.titleWrap}>
            <h3 className={styles.title}>{item.recipeTitle}</h3>
            <span className={styles.author}>от {item.recipeAuthor}</span>
          </div>
        </div>
        <div className={styles.date}>
          <CalendarDaysIcon className={styles.dateIcon} />
          <span>{new Date(item.dateISO).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      <div className={styles.ratingRow}>
        <Stars value={item.rating} />
        <span>{item.rating}/5</span>
        {item.verified && <span className={styles.verifyChip}>Подтверждённый повар</span>}
      </div>

      <div className={styles.commentBox}>{item.text}</div>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <span className={styles.footerItem}><HandThumbUpIcon className={styles.footerIcon} /> {item.likes} лайков</span>
          <span className={styles.footerItem}><ChatBubbleLeftRightIcon className={styles.footerIcon} /> {item.replies} ответов</span>
        </div>
        <div className={styles.footerRight}>
          <span className={styles.footerItem}><ArrowUturnLeftIcon className={styles.footerIcon} /> Ответить</span>
        </div>
      </div>
    </article>
  );
};

export default CommentCard;


