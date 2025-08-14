import React, { useMemo } from 'react';
import styles from './HistorySection.module.css';
import SectionHeader from '../../components/SectionHeader';
import { UserIcon } from '@heroicons/react/24/outline';
import HistoryCard, { type HistoryItem } from '../../components/HistoryCard';

/**
 * Демонстрационные записи истории приготовления.
 * Каждый элемент соответствует модели `HistoryItem`.
 *
 * @property {string} id Уникальный идентификатор события
 * @property {string} recipeTitle Название рецепта
 * @property {string} authorName Имя автора рецепта
 * @property {string} [photo] Фото результата приготовления (опционально)
 * @property {string} [comment] Пользовательский комментарий/заметка (опционально)
 * @property {number} rating Оценка по 5‑балльной шкале
 * @property {number} durationMin Длительность приготовления в минутах
 * @property {('COOKED'|'ATTEMPTED'|'FAILED')} status Итоговый статус приготовления
 * @property {string} dateISO Дата события в формате ISO 8601
 */
const mockHistory: HistoryItem[] = [
  {
    id: 'h1',
    recipeTitle: 'Mediterranean Quinoa Salad',
    authorName: 'Chef Maria',
    photo: undefined,
    comment: 'Absolutely delicious! Added some extra feta cheese and it was perfect.',
    rating: 5,
    durationMin: 25,
    status: 'COOKED',
    dateISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'h2',
    recipeTitle: 'Sourdough Bread Basics',
    authorName: 'Baker John',
    photo: undefined,
    comment: 'Second attempt, better rise this time!',
    rating: 3,
    durationMin: 180,
    status: 'ATTEMPTED',
    dateISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
  },
  {
    id: 'h3',
    recipeTitle: 'Perfect Poached Eggs',
    authorName: 'Anna K.',
    photo: undefined,
    comment: 'Need to tweak the temperature – will try again.',
    rating: 2,
    durationMin: 10,
    status: 'FAILED',
    dateISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
  }
];

/**
 * Секция «Cooking History» в расширенном профиле.
 * Отображает ленту событий приготовления рецептов с краткой статистикой.
 *
 * @param {{}} props Параметры компонента (входные свойства не требуются)
 * @returns {JSX.Element} Разметка секции истории с заголовком и списком карточек
 */
const HistorySection: React.FC = () => {
  const items = useMemo(() => mockHistory, []);
  const total = items.length;

  return (
    <div className={styles.wrapper}>
      <SectionHeader
        title="Cooking History"
        description="Your culinary journey and experiences"
        stats={[{ label: 'Activities', value: total, tone: 'accent', icon: <UserIcon /> }]}
      />

      <div className={styles.list}>
        {items.map((it) => (
          <HistoryCard key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
};

export default HistorySection;


