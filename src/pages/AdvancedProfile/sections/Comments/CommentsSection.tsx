import React, { useMemo } from 'react';
import styles from './CommentsSection.module.css';
import SectionHeader from '../../components/SectionHeader';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import CommentCard, { type CommentItem } from '../../components/CommentCard';

/**
 * Демонстрационные комментарии пользователя к рецептам.
 * Каждый объект соответствует модели `CommentItem`.
 *
 * @property {string} id Уникальный идентификатор комментария
 * @property {string} recipeTitle Название рецепта
 * @property {string} recipeAuthor Автор рецепта
 * @property {string} [recipeImage] Обложка рецепта (опционально)
 * @property {number} rating Оценка по шкале 0..5
 * @property {boolean} [verified] Метка «Verified Cook» (опционально)
 * @property {string} text Текст комментария
 * @property {number} likes Число лайков
 * @property {number} replies Число ответов
 * @property {string} dateISO Дата публикации в ISO 8601
 */
const mockComments: CommentItem[] = [
  {
    id: 'c1',
    recipeTitle: 'Средиземноморский салат с киноа',
    recipeAuthor: 'Шеф Мария',
    rating: 5,
    verified: true,
    text: 'Это блюдо обожаю! Добавила чуть больше феты и черри — получилось изумительно.',
    likes: 12,
    replies: 3,
    dateISO: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'c2',
    recipeTitle: 'Основы хлеба на закваске',
    recipeAuthor: 'Пекарь Джон',
    rating: 4,
    text: 'Корочка вышла отличной, но над мякишем ещё поработаю. Спасибо за советы!',
    likes: 5,
    replies: 1,
    dateISO: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  }
];

/**
 * Секция «Мои комментарии» в расширенном профиле.
 * Отображает список комментариев пользователя к рецептам с короткой статистикой.
 *
 * @param {{}} props Параметры компонента (не принимает входных свойств)
 * @returns {JSX.Element} Разметка секции комментариев со списком карточек
 */
const CommentsSection: React.FC = () => {
  const items = useMemo(() => mockComments, []);

  return (
    <div className={styles.wrapper}>
      <SectionHeader
        title="Мои комментарии"
        description="Ваши отзывы и впечатления о рецептах"
        stats={[{ label: 'Комментарии', value: items.length, tone: 'accent', icon: <ChatBubbleLeftRightIcon /> }]}
      />
      <div className={styles.list}>
        {items.map((it) => (
          <CommentCard key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;


