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
    name: 'Chef Maria Santos',
    handle: 'mariasantos',
    avatarUrl: '',
    bio: 'Mediterranean cuisine specialist with 15 years of experience',
    location: 'Barcelona, Spain',
    stats: { followers: 12500, recipes: 89, rating: 4.8 },
    tags: ['Mediterranean', 'Healthy', 'Seafood']
  },
  {
    id: 'a2',
    name: 'Luca Romano',
    handle: 'lucacooks',
    avatarUrl: '',
    bio: 'Italian street food and artisan pasta enthusiast',
    location: 'Rome, Italy',
    stats: { followers: 8400, recipes: 56, rating: 4.6 },
    tags: ['Italian', 'Pasta', 'StreetFood']
  },
  {
    id: 'a3',
    name: 'Aya Nakamura',
    handle: 'ayanakamura',
    avatarUrl: '',
    bio: 'Home baker sharing simple Asian-inspired desserts',
    location: 'Kyoto, Japan',
    stats: { followers: 15200, recipes: 41, rating: 4.9 },
    tags: ['Desserts', 'Asian', 'HomeBaking']
  },
  {
    id: 'a4',
    name: 'Carlos Mendes',
    handle: 'grillwithcarlos',
    avatarUrl: '',
    bio: 'BBQ and open-fire cooking with a focus on fresh vegetables',
    location: 'Porto, Portugal',
    stats: { followers: 6100, recipes: 33, rating: 4.5 },
    tags: ['BBQ', 'Grill', 'Vegetables']
  }
];

/**
 * Секция «Following» в расширенном профиле.
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
        title="Following"
        description="Chefs and food creators you follow"
        stats={[{ label: 'Following', value: authors.length, tone: 'accent', icon: <UserGroupIcon /> }]}
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


