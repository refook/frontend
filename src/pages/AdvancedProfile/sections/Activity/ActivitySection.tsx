import React, { useMemo } from 'react';
import styles from './ActivitySection.module.css';
import SectionHeader from '../../components/SectionHeader';
import ActivityRow, { type ActivityItem } from '../../components/ActivityRow';

/**
 * Демонстрационные данные активности пользователя для отображения в секции.
 * Каждый объект соответствует модели `ActivityItem`.
 *
 * @property {string} id Уникальный идентификатор события
 * @property {('create'|'like'|'cook'|'follow'|'review'|'badge')} type Тип активности
 * @property {string} title Заголовок события
 * @property {string} [subtitle] Подзаголовок/дополнительное описание (опционально)
 * @property {string} [imageTitle] Строка-ключ для генерации превью-плейсхолдера (опционально)
 * @property {string} dateISO Дата и время события в формате ISO 8601
 */
const mock: ActivityItem[] = [
  { id: 'ac1', type: 'create', title: 'Created a new recipe', subtitle: 'Asian Fusion Salad Bowl', imageTitle: 'Asian Fusion Salad Bowl', dateISO: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
  { id: 'ac2', type: 'like', title: 'Your comment received 5 likes', subtitle: 'On Mediterranean Quinoa Salad by Chef Maria', imageTitle: 'Mediterranean Quinoa Salad', dateISO: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
  { id: 'ac3', type: 'cook', title: 'Cooked a recipe', subtitle: 'Thai Green Curry by Chef Siriporn – Rated 4 stars', imageTitle: 'Thai Green Curry', dateISO: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
  { id: 'ac4', type: 'follow', title: 'New follower', subtitle: 'Michael Thompson started following you', imageTitle: 'Michael Thompson', dateISO: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
  { id: 'ac5', type: 'review', title: 'Left a review', subtitle: 'Classic Chocolate Chip Cookies — 5 stars', imageTitle: 'Classic Chocolate Chip Cookies', dateISO: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
  { id: 'ac6', type: 'badge', title: 'Earned a badge', subtitle: 'Recipe Creator — For publishing your 5th recipe', imageTitle: 'Badge', dateISO: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() }
];

/**
 * Секция «Recent Activity» в расширенном профиле пользователя.
 * Показывает список последних действий пользователя (создание рецептов, лайки, подписки и т. д.).
 *
 * @param {{}} props Параметры компонента (не принимает входных свойств)
 * @returns {JSX.Element} Разметка секции активности со статистикой и списком событий
 */
const ActivitySection: React.FC = () => {
  const items = useMemo(() => mock, []);
  return (
    <div className={styles.wrapper}>
      <SectionHeader
        title="Recent Activity"
        description="Your latest cooking adventures and interactions"
        stats={[{ label: 'activities', value: items.length, tone: 'accent' }]}
      />

      <div className={styles.card}>
        {items.map((it) => (
          <ActivityRow key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
};

export default ActivitySection;


