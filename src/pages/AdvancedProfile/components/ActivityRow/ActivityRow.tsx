import React from 'react';
import styles from './ActivityRow.module.css';
import { PlusIcon, HeartIcon, FireIcon, UserPlusIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { FOOD_PLACEHOLDER_EMOJIS, hashStringToIndex } from '../../../../utils/emoji';

/**
 * Тип активности пользователя в ленте.
 */
export type ActivityType = 'create' | 'like' | 'cook' | 'follow' | 'review' | 'badge';

/**
 * Модель строки активности.
 * @property id Уникальный идентификатор события
 * @property type Тип активности
 * @property title Заголовок/основное событие
 * @property subtitle Подзаголовок/описание (опционально)
 * @property imageTitle Строка для генерации плейсхолдера превью (опционально)
 * @property dateISO Время события в ISO
 */
export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle?: string;
  imageTitle?: string;
  dateISO: string;
}

const RightIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
  const cls = `${styles.rightIcon} ${
    type === 'create' ? styles.right_create :
    type === 'like' ? styles.right_like :
    type === 'cook' ? styles.right_cook :
    type === 'follow' ? styles.right_follow :
    type === 'review' ? styles.right_review :
    styles.right_badge
  }`;
  const Icon = type === 'create' ? PlusIcon : type === 'like' ? HeartIcon : type === 'cook' ? FireIcon : type === 'follow' ? UserPlusIcon : type === 'review' ? StarIcon : StarIcon;
  return <span className={cls}><Icon /></span>;
};

/**
 * Строка активности внутри списка.
 * @param props Параметры
 * @param props.item Объект активности `ActivityItem`
 */
const ActivityRow: React.FC<{ item: ActivityItem }> = ({ item }) => {
  const ph = FOOD_PLACEHOLDER_EMOJIS[hashStringToIndex(item.imageTitle ?? item.title, FOOD_PLACEHOLDER_EMOJIS.length)];
  return (
    <div className={styles.row}>
      <div className={styles.thumb} aria-label={item.title}>{ph}</div>
      <div>
        <h4 className={styles.title}>{item.title}</h4>
        {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
        <div className={styles.timeRow}><ClockIcon className={styles.timeIcon} />{new Date(item.dateISO).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' })} ago</div>
      </div>
      <RightIcon type={item.type} />
    </div>
  );
};

export default ActivityRow;


