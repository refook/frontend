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
  { id: 'ac1', type: 'create', title: 'Создан новый рецепт', subtitle: 'Салат в азиатском стиле', imageTitle: 'Салат в азиатском стиле', dateISO: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
  { id: 'ac2', type: 'like', title: 'Ваш комментарий получил 5 лайков', subtitle: 'К рецепту «Средиземноморский салат с киноа» от Шеф Марии', imageTitle: 'Средиземноморский салат с киноа', dateISO: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
  { id: 'ac3', type: 'cook', title: 'Приготовлено блюдо', subtitle: 'Тайский зелёный карри от шефа Сирипорн — оценка 4 звезды', imageTitle: 'Тайский зелёный карри', dateISO: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
  { id: 'ac4', type: 'follow', title: 'Новый подписчик', subtitle: 'Майкл Томпсон подписался на вас', imageTitle: 'Майкл Томпсон', dateISO: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
  { id: 'ac5', type: 'review', title: 'Оставлен отзыв', subtitle: 'Классическое печенье с шоколадной крошкой — 5 звёзд', imageTitle: 'Классическое печенье с шоколадной крошкой', dateISO: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
  { id: 'ac6', type: 'badge', title: 'Получена награда', subtitle: '«Создатель рецептов» — за публикацию пятого рецепта', imageTitle: 'Награда', dateISO: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() }
];

/**
 * Секция «Последняя активность» в расширенном профиле пользователя.
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
        title="Последняя активность"
        description="Ваши последние кулинарные действия и взаимодействия"
        stats={[{ label: 'Активности', value: items.length, tone: 'accent' }]}
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


