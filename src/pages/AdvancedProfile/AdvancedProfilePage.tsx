import React from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './AdvancedProfilePage.module.css';
import ProfileCard, { type AdvancedProfileUser } from './components/ProfileCard';
import ProfileTabs, { type TabId } from './components/ProfileTabs/ProfileTabs';
import SectionHeader from './components/SectionHeader';
import FavoritesSection from './sections/Favorites/FavoritesSection';
import HistorySection from './sections/History/HistorySection';
import FollowingSection from './sections/Following/FollowingSection';
import RecipesSection from './sections/Recipes/RecipesSection';
import CommentsSection from './sections/Comments/CommentsSection';
import ActivitySection from './sections/Activity/ActivitySection';

/**
 * Демонстрационные данные пользователя для «Advanced Profile».
 * Соответствуют типу `AdvancedProfileUser`.
 *
 * Структура `AdvancedProfileUser`:
 * @property {string} name Отображаемое имя пользователя
 * @property {string} username Никнейм без символа `@`
 * @property {string} [avatarUrl] URL аватарки (опционально)
 * @property {string} [location] Локация пользователя (опционально)
 * @property {string} joinedAt Дата регистрации в ISO 8601
 * @property {string} [bio] Короткое описание/био (опционально)
 * @property {{recipes: number; followers: number; following: number; likes: number}} stats Статистика профиля
 * @property {{id: string; label: string; color: ('gold'|'blue'|'purple')}[]} badges Значки/награды пользователя
 */
const mockUser: AdvancedProfileUser = {
  name: 'Sarah Johnson',
  username: 'sarahcooks',
  avatarUrl: '',
  location: 'San Francisco, CA',
  joinedAt: '2022-03-01T00:00:00Z',
  bio: 'Home chef passionate about Mediterranean cuisine and healthy cooking. Always experimenting with new flavors!',
  stats: {
    recipes: 24,
    followers: 1248,
    following: 89,
    likes: 3942
  },
  badges: [
    { id: 'master', label: 'Master Chef', color: 'gold' },
    { id: 'creator', label: 'Recipe Creator', color: 'blue' },
    { id: 'hero', label: 'Community Hero', color: 'purple' }
  ]
};

/**
 * Страница расширенного профиля пользователя.
 * Состоит из карточки профиля, вкладок и контента выбранной вкладки:
 * избранное, история, подписки, мои рецепты, комментарии, активность.
 *
 * @param {{}} props Параметры компонента (входные свойства не требуются)
 * @returns {JSX.Element} Разметка страницы расширенного профиля
 */
const AdvancedProfilePage: React.FC = () => {
  const user = mockUser;

  const [activeTab, setActiveTab] = React.useState<TabId>('favorites');
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    const allowed = ['favorites', 'history', 'following', 'recipes', 'comments', 'activity'] as const;
    if (tabParam && (allowed as readonly string[]).includes(tabParam)) {
      setActiveTab(tabParam as TabId);
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (searchParams.get('tab') !== activeTab) {
      const next = new URLSearchParams(searchParams);
      next.set('tab', activeTab);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div className={styles.wrapper}>
      <ProfileCard user={user} />
      <ProfileTabs initial={activeTab} onChange={setActiveTab} />
      {activeTab === 'favorites' && <FavoritesSection />}
      {activeTab === 'history' && <HistorySection />}
      {activeTab === 'following' && <FollowingSection />}
      {activeTab === 'recipes' && <RecipesSection />}
      {activeTab === 'comments' && <CommentsSection />}
      {activeTab === 'activity' && <ActivitySection />}
    </div>
  );
};

export default AdvancedProfilePage;


