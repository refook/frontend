import React, { useMemo } from 'react';
import styles from './FollowingSection.module.css';
import SectionHeader from '../../components/SectionHeader';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import FollowingCard, { type FollowingAuthor } from '../../components/FollowingCard';

/**
 * Демонстрационный список авторов, на которых подписан пользователь.
 * Каждый элемент соответствует типу `FollowingAuthor`.
 *
 * Структура `FollowingAuthor`:
 * @property {string} id Уникальный идентификатор
 * @property {string} name Имя и фамилия автора
 * @property {string} handle Никнейм без символа `@`
 * @property {string} [avatarUrl] URL аватарки (опционально)
 * @property {string} [bio] Короткое описание/био (опционально)
 * @property {string} [location] Локация автора (опционально)
 * @property {{followers: number; recipes: number; rating: number}} stats Статистика профиля
 * @property {string[]} tags Список тегов/интересов
 */
const mockAuthors: FollowingAuthor[] = [
  {
    id: 'a1',
    name: 'Шеф Мария Сантос',
    handle: 'mariasantos',
    avatarUrl: '',
    bio: 'Специалист по средиземноморской кухне с 15-летним стажем',
    location: 'Барселона, Испания',
    stats: { followers: 12500, recipes: 89, rating: 4.8 },
    tags: ['Средиземноморская', 'Здоровое питание', 'Морепродукты']
  },
  {
    id: 'a2',
    name: 'Лука Романо',
    handle: 'lucacooks',
    avatarUrl: '',
    bio: 'Ценитель итальянского стритфуда и ремесленной пасты',
    location: 'Рим, Италия',
    stats: { followers: 8400, recipes: 56, rating: 4.6 },
    tags: ['Итальянская', 'Паста', 'Стритфуд']
  },
  {
    id: 'a3',
    name: 'Ая Накамура',
    handle: 'ayanakamura',
    avatarUrl: '',
    bio: 'Домашний кондитер, делюсь простыми десертами с азиатскими мотивами',
    location: 'Киото, Япония',
    stats: { followers: 15200, recipes: 41, rating: 4.9 },
    tags: ['Десерты', 'Азиатская кухня', 'Домашняя выпечка']
  },
  {
    id: 'a4',
    name: 'Карлос Мендес',
    handle: 'grillwithcarlos',
    avatarUrl: '',
    bio: 'Готовлю на гриле и открытом огне с акцентом на свежие овощи',
    location: 'Порту, Португалия',
    stats: { followers: 6100, recipes: 33, rating: 4.5 },
    tags: ['BBQ', 'Гриль', 'Овощи']
  }
];

/**
 * Секция «Подписки» в расширенном профиле.
 * Отображает карточки авторов, на которых подписан пользователь, и
 * краткую статистику с общим числом подписок.
 *
 * @param {{}} props Параметры компонента (не принимает входных свойств)
 * @returns {JSX.Element} Разметка секции с заголовком и списком `FollowingCard`
 */
const FollowingSection: React.FC = () => {
  const authors = useMemo(() => mockAuthors, []);

  return (
    <div className={styles.wrapper}>
      <SectionHeader
        title="Подписки"
        description="Авторы и кулинары, на которых вы подписаны"
        stats={[{ label: 'Подписки', value: authors.length, tone: 'accent', icon: <UserGroupIcon /> }]}
      />

      <div className={styles.list}>
        {authors.map((a) => (
          <FollowingCard key={a.id} author={a} />
        ))}
      </div>
    </div>
  );
};

export default FollowingSection;


