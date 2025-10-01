import React from 'react';
import styles from './ProfileRecipeCard.module.css';
import { Link } from 'react-router-dom';
import { ClockIcon, EyeIcon, HeartIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import type { Recipe } from '../../../../types';
import { FOOD_PLACEHOLDER_EMOJIS, hashStringToIndex } from '../../../../utils/emoji';

/**
 * Дополнительные метаданные рецепта для отображения в профиле.
 * @property views Количество просмотров
 * @property likes Количество лайков
 * @property comments Количество комментариев
 * @property publishedAt Дата публикации в ISO
 * @property status Статус публикации (PUBLISHED/DRAFT)
 */
export interface ProfileRecipeMeta {
  views: number;
  likes: number;
  comments: number;
  publishedAt: string; // ISO
  status: 'PUBLISHED' | 'DRAFT';
}

/**
 * Свойства карточки рецепта на странице профиля.
 * @param recipe Объект рецепта
 * @param meta Метаданные для профиля
 */
interface ProfileRecipeCardProps { recipe: Recipe; meta: ProfileRecipeMeta; }

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return new Intl.RelativeTimeFormat('ru', { numeric: 'auto' }).format(
    Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  );
};

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes} мин`;

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
};

/**
 * Карточка рецепта в профиле с расширенной статистикой.
 * Показывает обложку, статус (Опубликован/Черновик),
 * рейтинг, длительность, просмотры, лайки, комментарии,
 * теги и кнопки «Открыть»/«Редактировать».
 *
 * @param props Параметры компонента
 * @param props.recipe Объект рецепта
 * @param props.meta Объект метаданных
 */
const ProfileRecipeCard: React.FC<ProfileRecipeCardProps> = ({ recipe, meta }) => {
  const fallbackEmoji = FOOD_PLACEHOLDER_EMOJIS[hashStringToIndex(recipe.title ?? '', FOOD_PLACEHOLDER_EMOJIS.length)];
  const statusClass = meta.status === 'PUBLISHED' ? styles.chip_success : styles.chip_muted;
  const difficultyValue = String(recipe.difficulty ?? '').toLowerCase();
  const difficultyLabel = difficultyValue === 'easy'
    ? 'Лёгко'
    : difficultyValue === 'medium'
      ? 'Средне'
      : difficultyValue === 'hard'
        ? 'Сложно'
        : recipe.difficulty ? String(recipe.difficulty) : '';
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        {recipe.image ? (
          <img src={recipe.image as string} alt={recipe.title} className={styles.image} />
        ) : (
          <div className={styles.placeholder} aria-label="заглушка">{fallbackEmoji}</div>
        )}
        <div className={styles.statusChips}>
          <span className={`${styles.chip} ${statusClass}`}>{meta.status === 'PUBLISHED' ? 'Опубликовано' : 'Черновик'}</span>
          {difficultyLabel && (
            <span className={`${styles.chip} ${styles.chip_muted}`}>{difficultyLabel}</span>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{recipe.title}</h3>
        {recipe.description && <p className={styles.description}>{recipe.description}</p>}

        <div className={styles.meta}>
          <div className={styles.metaItem}><StarSolidIcon className={styles.ratingIcon} /><span>{recipe.stats?.rating ?? 0}</span></div>
          <div className={styles.metaItem}><ClockIcon className={styles.metaIcon} /><span>{formatTime((recipe.prepTime ?? 0) + (recipe.cookTime ?? 0))}</span></div>
          <div className={styles.metaItem}><EyeIcon className={styles.metaIcon} /><span>{meta.views}</span></div>
          <div className={styles.metaItem}><HeartIcon className={styles.metaIcon} /><span>{meta.likes}</span></div>
          <div className={styles.metaItem}><ChatBubbleLeftRightIcon className={styles.metaIcon} /><span>{meta.comments}</span></div>
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className={styles.tags}>
            {recipe.tags.slice(0, 3).map((t, i) => <span className={styles.tag} key={i}>{t}</span>)}
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.date}>{formatDate(meta.publishedAt)}</span>
          <div className={styles.btns}>
            <Link to={`/recipe/${recipe.id}`} className={styles.btn}>Открыть</Link>
            <Link to={`/recipe/${recipe.id}/edit`} className={styles.btn}>Редактировать</Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProfileRecipeCard;


